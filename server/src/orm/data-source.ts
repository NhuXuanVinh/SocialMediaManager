import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { Group } from '../entities/group.entity';
import { AccountGroup } from '../entities/account-group.entity';
import { TwitterAccount } from '../entities/twitter-account.entity';
import { FacebookAccount } from '../entities/facebook-account.entity';
import { LinkedinAccount } from '../entities/linkedin-account.entity';
import { Post } from '../entities/post.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Account, Group, AccountGroup, TwitterAccount, FacebookAccount, LinkedinAccount, Post],
  synchronize: true,
  logging: false,
});

export async function ensureDataSourceInitialized(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
