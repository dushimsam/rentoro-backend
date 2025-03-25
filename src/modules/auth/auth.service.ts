import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleUserDto } from './dto/google-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async validateOAuthUser(profile: GoogleUserDto): Promise<any> {
    const { email, firstName, lastName, picture } = profile;
    
    // Find user or create if doesn't exist
    let user = await this.usersService.findByEmail(email);
    
    if (!user) {
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        picture,
        isEmailVerified: true, // Google already verified the email
      });
    } else {
      // Update user info if needed
      await this.usersService.update(user.id, {
        firstName,
        lastName,
        picture,
      });
    }
    
    return user;
  }

  async login(user: any) {
    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email,
      roles: user.roles || ['user'],
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { 
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // Refresh token expires in 7 days
      },
    );
    
    // Store refresh token hash in user record for additional security
    await this.usersService.storeRefreshToken(user.id, refreshToken);
    
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      
      // Get user
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Verify token is still valid in our store
      const isValid = await this.usersService.validateRefreshToken(
        user.id, 
        refreshToken
      );
      
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Generate new tokens
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return user;
  }
}