import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
const linkedinController = require(path.join(process.cwd(), 'controllers/linkedinController'));

@Controller()
export class LinkedinController {
  @Post('post/linkedin')
  async post(@Req() req: Request, @Res() res: Response) {
    return linkedinController.postToLinkedIn(req, res);
  }
}
