import { Controller, Get, Post, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
  googleAuth() {
    // This route initiates the Google OAuth flow
    // The guard will redirect to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback handler for login' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    this.logger.log(`User logged in with Google: ${req.user.email}`);
    const { token } = await this.authService.login(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}`);
  }

  @Get('google/signup')
  @UseGuards(AuthGuard('google-signup'))
  @ApiOperation({ summary: 'Initiate Google OAuth signup flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
  googleSignup() {
    // This route initiates the Google OAuth signup flow
    // Uses a specific strategy that calls createUserFromOAuth()
    // The guard will redirect to Google for authentication
  }

  @Get('google/signup/callback')
  @UseGuards(AuthGuard('google-signup'))
  @ApiOperation({ summary: 'Google OAuth callback handler for signup' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to frontend with token after signup/login' 
  })
  async googleSignupCallback(@Req() req, @Res() res: Response) {
    // User has been created by the google-signup strategy
    this.logger.log(`User signed up with Google: ${req.user.email}`);
    const { token } = await this.authService.login(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/signup/success?token=${token}`);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ 
    status: 200, 
    description: 'New JWT token',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Req() req) {
    const refreshToken = req.body.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req) {
    this.logger.log(`User logged out: ${req.user.email}`);
    // Implement token revocation if needed
    return { success: true, message: 'Successfully logged out' };
  }
}