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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterAccount = void 0;
const typeorm_1 = require("typeorm");
const account_entity_1 = require("./account.entity");
let TwitterAccount = class TwitterAccount {
};
exports.TwitterAccount = TwitterAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], TwitterAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], TwitterAccount.prototype, "twitter_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TwitterAccount.prototype, "access_token", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TwitterAccount.prototype, "access_token_secret", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TwitterAccount.prototype, "profile_url", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => account_entity_1.Account, (account) => account.twitter),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'accountId' }),
    __metadata("design:type", account_entity_1.Account)
], TwitterAccount.prototype, "account", void 0);
exports.TwitterAccount = TwitterAccount = __decorate([
    (0, typeorm_1.Entity)('twitter_accounts')
], TwitterAccount);
//# sourceMappingURL=twitter-account.entity.js.map