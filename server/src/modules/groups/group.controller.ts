import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('create')
  async create(@Body() body: any, @Res() res: Response) {
    try {
      const { userId, name } = body;
      const group = await this.groupService.createGroup(Number(userId), name);
      return res.status(201).json({ message: 'Group created successfully', group });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error creating group' });
    }
  }

  @Post('add-account')
  async addAccount(@Body() body: any, @Res() res: Response) {
    try {
      const { groupId, accountId } = body;
      await this.groupService.addAccountToGroup(Number(groupId), Number(accountId));
      return res.status(200).json({ message: 'Account added to group successfully' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ message: err.message || 'Error adding account to group' });
    }
  }

  @Post('remove-account')
  async removeAccount(@Body() body: any, @Res() res: Response) {
    try {
      const { groupId, accountId } = body;
      await this.groupService.removeAccountFromGroup(Number(groupId), Number(accountId));
      return res.status(200).json({ message: 'Account removed from group successfully' });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ message: err.message || 'Error removing account from group' });
    }
  }

  @Get(':userId')
  async getByUser(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const groups = await this.groupService.getGroupsByUser(Number(userId));
      return res.status(200).json({ groups: groups || [] });
    } catch (err: any) {
      return res.status(500).json({ message: 'Error fetching groups for user' });
    }
  }

  @Get('find/:groupId')
  async getById(@Param('groupId') groupId: string, @Res() res: Response) {
    try {
      const group = await this.groupService.getGroupById(Number(groupId));
      return res.status(200).json({ group });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ message: err.message || 'Server error' });
    }
  }
}
