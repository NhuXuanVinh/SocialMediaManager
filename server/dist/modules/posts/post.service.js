"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const twitter_api_v2_1 = require("twitter-api-v2");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("../../entities/post.entity");
const twitter_account_entity_1 = require("../../entities/twitter-account.entity");
let PostService = class PostService {
    constructor(postRepo, twitterAccountRepo) {
        this.postRepo = postRepo;
        this.twitterAccountRepo = twitterAccountRepo;
    }
    async postTwitter(accountId, text, files) {
        const twitterAccount = await this.twitterAccountRepo.findOne({ where: { account: { accountId } } });
        if (!twitterAccount)
            throw new Error('Twitter account not linked.');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_KEY,
            appSecret: process.env.TWITTER_CONSUMER_SECRET,
            accessToken: twitterAccount.access_token,
            accessSecret: twitterAccount.access_token_secret,
        });
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
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(twitter_account_entity_1.TwitterAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PostService);
//# sourceMappingURL=post.service.js.map