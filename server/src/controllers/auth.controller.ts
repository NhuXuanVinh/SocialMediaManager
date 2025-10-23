import { Controller, Post, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
const authController = require(path.join(process.cwd(), 'controllers/authController'));
const authMiddleware = require(path.join(process.cwd(), 'middleware/authMiddleware'));

@Controller('auth')
export class AuthController {
  @Post('register')
  async register(@Req() req: Request, @Res() res: Response) {
    return authController.registerUser(req, res);
  }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    return authController.loginUser(req, res);
  }

  @Get('protected')
  async protected(@Req() req: Request, @Res() res: Response) {
    return new Promise<void>((resolve) => {
      authMiddleware(req, res, () => {
        res.json({ message: 'Protected data accessed', user: { username: (req as any).user.username } });
        resolve();
      });
    });
  }
}
