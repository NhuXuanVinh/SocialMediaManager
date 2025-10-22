import { Controller, Post, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
const twitterController = require(path.join(process.cwd(), 'controllers/twitterController'));
const authMiddleware = require(path.join(process.cwd(), 'middleware/authMiddleware'));

@Controller()
export class TwitterController {
  @Post('auth/twitter')
  async startOAuth(@Req() req: Request, @Res() res: Response) {
    return new Promise<void>((resolve) => {
      authMiddleware(req, res, () => {
        twitterController.startOAuthFlow(req, res);
        resolve();
      });
    });
  }

  @Get('auth/twitter/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    return twitterController.handleOAuthCallback(req, res);
  }

  @Post('post/twitter')
  async postTweet(@Req() req: Request, @Res() res: Response) {
    return twitterController.postTweet(req, res);
  }
}
