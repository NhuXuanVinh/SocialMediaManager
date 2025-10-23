import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { GroupModule } from './modules/groups/group.module';
import { AccountModule } from './modules/accounts/account.module';
import { PostModule } from './modules/posts/post.module';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { Group } from './entities/group.entity';
import { AccountGroup } from './entities/account-group.entity';
import { TwitterAccount } from './entities/twitter-account.entity';
import { FacebookAccount } from './entities/facebook-account.entity';
import { LinkedinAccount } from './entities/linkedin-account.entity';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        synchronize: true,
        logging: false,
        entities: [User, Account, Group, AccountGroup, TwitterAccount, FacebookAccount, LinkedinAccount, Post],
      }),
    }),
    TypeOrmModule.forFeature([User, Account, Group, AccountGroup, TwitterAccount, FacebookAccount, LinkedinAccount, Post]),
    AuthModule,
    GroupModule,
    AccountModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
