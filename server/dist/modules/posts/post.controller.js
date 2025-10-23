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
exports.PostController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const post_service_1 = require("./post.service");
let PostController = class PostController {
    constructor(postService) {
        this.postService = postService;
    }
    async post(body, files, res) {
        try {
            const { text, accounts, postType, scheduledTime } = body;
            const parsedAccounts = typeof accounts === 'string' ? JSON.parse(accounts) : accounts;
            for (const account of parsedAccounts) {
                if (account.platform === 'Twitter' && postType === 'now') {
                    await this.postService.postTwitter(Number(account.account_id), text, files);
                }
            }
            return res.status(200).json({ message: 'Post successful' });
        }
        catch (err) {
            return res.status(400).send('Some thing wrong happend');
        }
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Post)('post'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', undefined, { dest: 'uploads/' })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "post", null);
exports.PostController = PostController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostController);
//# sourceMappingURL=post.controller.js.map