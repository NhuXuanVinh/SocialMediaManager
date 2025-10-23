import { Controller, Post, Req, Res, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { Request, Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
const postController = require(path.join(process.cwd(), 'controllers/postController'));

@Controller()
export class PostController {
  @Post('post')
  @UseInterceptors(FilesInterceptor('media', undefined, { dest: 'uploads/' }))
  async post(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request, @Res() res: Response) {
    // Align with existing controller expecting req.files and req.body
    (req as any).files = files;
    return postController.handlePost(req, res);
  }
}
