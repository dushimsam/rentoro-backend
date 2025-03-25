import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates the Google OAuth flow
    // The guard will redirect to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(req.user);
    
    // Set tokens in cookies or return them in response
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60 * 1000, // 30 minutes
    });
    
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Redirect to frontend after successful login
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    // Clear auth cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return res.json({ message: 'Logged out successfully' });
  }

  @Get('refresh-token')
  async refreshToken(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    
    if (!refreshToken) {
      return res.status(401).json({
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'Refresh token not found',
      });
    }
    
    try {
      const { accessToken, refreshToken: newRefreshToken } = 
        await this.authService.refreshToken(refreshToken);
      
      // Set new tokens in cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000, // 30 minutes
      });
      
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/auth/refresh-token',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
      // Clear cookies on error
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      
      return res.status(401).json({
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }
  }
}