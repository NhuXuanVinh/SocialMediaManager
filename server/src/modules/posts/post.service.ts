import { Injectable } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post as PostEntity } from '../../entities/post.entity';
import { TwitterAccount } from '../../entities/twitter-account.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(TwitterAccount) private readonly twitterAccountRepo: Repository<TwitterAccount>,
  ) {}

  async postTwitter(accountId: number, text: string, files?: Express.Multer.File[]) {
    const twitterAccount = await this.twitterAccountRepo.findOne({ where: { account: { accountId } } });
    if (!twitterAccount) throw new Error('Twitter account not linked.');

    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY as string,
      appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
      accessToken: twitterAccount.access_token,
      accessSecret: twitterAccount.access_token_secret,
    });

    // media upload omitted for brevity; existing controller still handles
    const { data: tweet } = await client.v2.tweet({ text });

    const newPost = this.postRepo.create({
      account: { accountId },
      post_platform_id: tweet.id,
      post_link: `https://twitter.com/${twitterAccount.twitter_user_id}/status/${tweet.id}`,
      content: text,
      scheduledAt: null,
      status: 'posted',
    });
    await this.postRepo.save(newPost);
    return tweet;
  }
}
