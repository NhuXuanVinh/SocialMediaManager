import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../../entities/group.entity';
import { Account } from '../../entities/account.entity';
import { AccountGroup } from '../../entities/account-group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Account, AccountGroup])],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
