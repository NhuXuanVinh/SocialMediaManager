import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any, @Res() res: Response) {
    try {
      const { email, username, password } = body;
      await this.authService.register(email, username, password);
      return res.status(201).json({ message: 'User registered' });
    } catch (err: any) {
      const status = err.message.includes('exists') || err.message.includes('used') ? 400 : 500;
      return res.status(status).json({ message: err.message || 'Server error' });
    }
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const { username, password } = body;
      const result = await this.authService.login(username, password);
      return res.json(result);
    } catch (err: any) {
      const status = err.message.includes('exist') || err.message.includes('password') ? 400 : 500;
      return res.status(status).json({ message: err.message || 'Server error' });
    }
  }

  @Get('protected')
  async protected(@Res() res: Response) {
    return res.json({ message: 'Protected data accessed' });
  }
}
