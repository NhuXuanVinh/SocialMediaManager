import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { TwitterController } from './controllers/twitter.controller';
import { GroupController } from './controllers/group.controller';
import { AccountController } from './controllers/account.controller';
import { PostController } from './controllers/post.controller';
import { LinkedinController } from './controllers/linkedin.controller';
import { FacebookController } from './controllers/facebook.controller';
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
  ],
  controllers: [
    AuthController,
    TwitterController,
    GroupController,
    AccountController,
    PostController,
    LinkedinController,
    FacebookController,
  ],
  providers: [],
})
export class AppModule {}
