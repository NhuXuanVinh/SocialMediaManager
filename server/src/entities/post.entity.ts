import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id' })
  post_id!: number;

  @Column({ nullable: true })
  post_platform_id!: string | null;

  @Column({ nullable: true })
  post_link!: string | null;

  @Column('text')
  content!: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt!: Date | null;

  @Column({ nullable: true })
  status!: string | null;

  @ManyToOne(() => Account, (account) => account.posts)
  account!: Account;
}
