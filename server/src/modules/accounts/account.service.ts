import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(@InjectRepository(Account) private readonly accountRepo: Repository<Account>) {}

  async getAccountsByUser(userId: number) {
    return this.accountRepo.find({ where: { user: { id: userId } }, relations: ['posts'] });
  }
}
