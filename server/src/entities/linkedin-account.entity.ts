import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('linkedin_accounts')
export class LinkedinAccount {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ unique: true })
  linkedin_user_id!: string;

  @Column('text')
  access_token!: string;

  @Column()
  profile_url!: string;

  @OneToOne(() => Account, (account) => account.linkedin)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'accountId' })
  account!: Account;
}
