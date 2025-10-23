import { Controller, Post, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
const groupController = require(path.join(process.cwd(), 'controllers/groupController'));

@Controller('groups')
export class GroupController {
  @Post('create')
  async create(@Req() req: Request, @Res() res: Response) {
    return groupController.createGroup(req, res);
  }

  @Post('add-account')
  async addAccount(@Req() req: Request, @Res() res: Response) {
    return groupController.addAccountToGroup(req, res);
  }

  @Post('remove-account')
  async removeAccount(@Req() req: Request, @Res() res: Response) {
    return groupController.removeAccountFromGroup(req, res);
  }

  @Get(':userId')
  async getByUser(@Req() req: Request, @Res() res: Response) {
    return groupController.getGroupsByUser(req, res);
  }

  @Get('find/:groupId')
  async getById(@Req() req: Request, @Res() res: Response) {
    return groupController.getGroupById(req, res);
  }
}
