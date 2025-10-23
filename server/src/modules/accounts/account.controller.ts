import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('get-accounts/:userId')
  async getAccounts(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const accounts = await this.accountService.getAccountsByUser(Number(userId));
      return res.status(200).json({ accounts: accounts || [] });
    } catch (err: any) {
      return res.status(500).json({ message: 'Error fetching accounts' });
    }
  }
}
