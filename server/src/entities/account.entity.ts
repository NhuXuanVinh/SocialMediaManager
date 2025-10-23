import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';
import { TwitterAccount } from './twitter-account.entity';
import { FacebookAccount } from './facebook-account.entity';
import { LinkedinAccount } from './linkedin-account.entity';
import { Post } from './post.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn({ name: 'account_id' })
  accountId!: number;

  @ManyToOne(() => User, (user) => user.accounts)
  user!: User;

  @Column()
  platform!: string;

  @Column()
  account_name!: string;

  @Column({ nullable: true })
  account_url!: string | null;

  @OneToOne(() => TwitterAccount, (tw) => tw.account)
  twitter?: TwitterAccount;

  @OneToOne(() => FacebookAccount, (fb) => fb.account)
  facebook?: FacebookAccount;

  @OneToOne(() => LinkedinAccount, (li) => li.account)
  linkedin?: LinkedinAccount;

  @OneToMany(() => Post, (post) => post.account)
  posts!: Post[];

  @ManyToMany(() => Group, (group) => group.accounts)
  @JoinTable({
    name: 'account_groups',
    joinColumn: { name: 'account_id', referencedColumnName: 'accountId' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'groupId' },
  })
  groups!: Group[];
}
