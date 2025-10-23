import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../../entities/group.entity';
import { Account } from '../../entities/account.entity';
import { AccountGroup } from '../../entities/account-group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Account) private readonly accountRepo: Repository<Account>,
    @InjectRepository(AccountGroup) private readonly accountGroupRepo: Repository<AccountGroup>,
  ) {}

  async createGroup(userId: number, name: string) {
    const group = this.groupRepo.create({ group_name: name, user: { id: userId } as any });
    await this.groupRepo.save(group);
    return group;
  }

  async addAccountToGroup(groupId: number, accountId: number) {
    const group = await this.groupRepo.findOne({ where: { groupId } });
    if (!group) throw new Error('Group not found');
    const account = await this.accountRepo.findOne({ where: { accountId } });
    if (!account) throw new Error('Account not found');
    const join = this.accountGroupRepo.create({ account_id: accountId, group_id: groupId });
    await this.accountGroupRepo.save(join);
  }

  async removeAccountFromGroup(groupId: number, accountId: number) {
    const group = await this.groupRepo.findOne({ where: { groupId } });
    if (!group) throw new Error('Group not found');
    const account = await this.accountRepo.findOne({ where: { accountId } });
    if (!account) throw new Error('Account not found');
    const join = await this.accountGroupRepo.findOne({ where: { account_id: accountId, group_id: groupId } });
    if (!join) throw new Error('Account not found in this group');
    await this.accountGroupRepo.remove(join);
  }

  async getGroupsByUser(userId: number) {
    return this.groupRepo.find({ where: { user: { id: userId } }, relations: ['accounts', 'accounts.posts'] });
  }

  async getGroupById(groupId: number) {
    const group = await this.groupRepo.findOne({ where: { groupId }, relations: ['accounts', 'accounts.posts'] });
    if (!group) throw new Error('Group not found');
    return group;
  }
}
