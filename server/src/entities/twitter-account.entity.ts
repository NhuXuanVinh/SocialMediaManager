import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('twitter_accounts')
export class TwitterAccount {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ unique: true })
  twitter_user_id!: string;

  @Column()
  access_token!: string;

  @Column()
  access_token_secret!: string;

  @Column()
  profile_url!: string;

  @OneToOne(() => Account, (account) => account.twitter)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'accountId' })
  account!: Account;
}
