import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';
import { User } from './user.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => User, (user) => user.groups)
  user!: User;

  @Column()
  group_name!: string;

  @ManyToMany(() => Account, (account) => account.groups)
  accounts!: Account[];
}
