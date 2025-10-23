import { Controller, Post, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
const facebookController = require(path.join(process.cwd(), 'controllers/facebookController'));

@Controller()
export class FacebookController {
  @Post('post/facebook')
  async post(@Req() req: Request, @Res() res: Response) {
    return facebookController.postToFacebook(req, res);
  }

  @Get('post/facebook/insights')
  async insights(@Req() req: Request, @Res() res: Response) {
    return facebookController.getFacebookPostInsights(req, res);
  }
}
