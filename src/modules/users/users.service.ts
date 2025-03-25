import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    // Update allowed fields
    if (updateUserDto.firstName) user.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (updateUserDto.picture) user.picture = updateUserDto.picture;
    
    return this.userRepository.save(user);
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    // Hash the token before storing
    const hashedToken = this.hashToken(token);
    
    // Set expiry date to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create refresh token record
    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: hashedToken,
      expiresAt,
    });
    
    await this.refreshTokenRepository.save(refreshToken);
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const hashedToken = this.hashToken(token);
    
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        userId,
        token: hashedToken,
        isRevoked: false,
      },
    });
    
    // Check if token exists and is not expired
    if (!refreshToken || refreshToken.isExpired()) {
      return false;
    }
    
    return true;
  }

  async revokeRefreshToken(userId: string, token: string): Promise<boolean> {
    const hashedToken = this.hashToken(token);
    
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        userId,
        token: hashedToken,
      },
    });
    
    if (!refreshToken) {
      return false;
    }
    
    // Mark as revoked
    refreshToken.isRevoked = true;
    await this.refreshTokenRepository.save(refreshToken);
    return true;
  }

  // Helper method to hash tokens
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}