import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('facebook_accounts')
export class FacebookAccount {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ unique: true })
  facebook_user_id!: string;

  @Column('text')
  access_token!: string;

  @Column()
  profile_url!: string;

  @OneToOne(() => Account, (account) => account.facebook)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'accountId' })
  account!: Account;
}
