import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
const accountController = require(path.join(process.cwd(), 'controllers/accountController'));

@Controller('account')
export class AccountController {
  @Get('get-accounts/:userId')
  async getAccounts(@Req() req: Request, @Res() res: Response) {
    return accountController.getAccountsByUser(req, res);
  }
}
