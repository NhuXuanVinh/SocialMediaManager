import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Account } from './account.entity';
import { Group } from './group.entity';

@Entity('account_groups')
export class AccountGroup {
  @PrimaryColumn()
  account_id!: number;

  @PrimaryColumn()
  group_id!: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'accountId' })
  account!: Account;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id', referencedColumnName: 'groupId' })
  group!: Group;
}
