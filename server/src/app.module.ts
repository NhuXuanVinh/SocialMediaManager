import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { TwitterController } from './controllers/twitter.controller';
import { GroupController } from './controllers/group.controller';
import { AccountController } from './controllers/account.controller';
import { PostController } from './controllers/post.controller';
import { LinkedinController } from './controllers/linkedin.controller';
import { FacebookController } from './controllers/facebook.controller';

@Module({
  imports: [],
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
