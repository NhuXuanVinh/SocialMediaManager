import { Controller, Post as PostMethod, Body, Res, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PostService } from './post.service';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @PostMethod('post')
  @UseInterceptors(FilesInterceptor('media', undefined, { dest: 'uploads/' }))
  async post(@Body() body: any, @UploadedFiles() files: Express.Multer.File[], @Res() res: Response) {
    try {
      const { text, accounts, postType, scheduledTime } = body;
      // For now, mimic existing behavior: immediate post for Twitter accounts
      const parsedAccounts = typeof accounts === 'string' ? JSON.parse(accounts) : accounts;
      for (const account of parsedAccounts) {
        if (account.platform === 'Twitter' && postType === 'now') {
          await this.postService.postTwitter(Number(account.account_id), text, files);
        }
      }
      return res.status(200).json({ message: 'Post successful' });
    } catch (err: any) {
      return res.status(400).send('Some thing wrong happend');
    }
  }
}
