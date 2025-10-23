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
exports.Account = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const group_entity_1 = require("./group.entity");
const twitter_account_entity_1 = require("./twitter-account.entity");
const facebook_account_entity_1 = require("./facebook-account.entity");
const linkedin_account_entity_1 = require("./linkedin-account.entity");
const post_entity_1 = require("./post.entity");
let Account = class Account {
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'account_id' }),
    __metadata("design:type", Number)
], Account.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.accounts),
    __metadata("design:type", user_entity_1.User)
], Account.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Account.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Account.prototype, "account_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "account_url", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => twitter_account_entity_1.TwitterAccount, (tw) => tw.account),
    __metadata("design:type", twitter_account_entity_1.TwitterAccount)
], Account.prototype, "twitter", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => facebook_account_entity_1.FacebookAccount, (fb) => fb.account),
    __metadata("design:type", facebook_account_entity_1.FacebookAccount)
], Account.prototype, "facebook", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => linkedin_account_entity_1.LinkedinAccount, (li) => li.account),
    __metadata("design:type", linkedin_account_entity_1.LinkedinAccount)
], Account.prototype, "linkedin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_entity_1.Post, (post) => post.account),
    __metadata("design:type", Array)
], Account.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => group_entity_1.Group, (group) => group.accounts),
    (0, typeorm_1.JoinTable)({
        name: 'account_groups',
        joinColumn: { name: 'account_id', referencedColumnName: 'accountId' },
        inverseJoinColumn: { name: 'group_id', referencedColumnName: 'groupId' },
    }),
    __metadata("design:type", Array)
], Account.prototype, "groups", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)('accounts')
], Account);
//# sourceMappingURL=account.entity.js.map