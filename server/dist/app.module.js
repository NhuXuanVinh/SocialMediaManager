"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const group_module_1 = require("./modules/groups/group.module");
const account_module_1 = require("./modules/accounts/account.module");
const post_module_1 = require("./modules/posts/post.module");
const user_entity_1 = require("./entities/user.entity");
const account_entity_1 = require("./entities/account.entity");
const group_entity_1 = require("./entities/group.entity");
const account_group_entity_1 = require("./entities/account-group.entity");
const twitter_account_entity_1 = require("./entities/twitter-account.entity");
const facebook_account_entity_1 = require("./entities/facebook-account.entity");
const linkedin_account_entity_1 = require("./entities/linkedin-account.entity");
const post_entity_1 = require("./entities/post.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: Number(process.env.DB_PORT) || 5432,
                    username: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                    synchronize: true,
                    logging: false,
                    entities: [user_entity_1.User, account_entity_1.Account, group_entity_1.Group, account_group_entity_1.AccountGroup, twitter_account_entity_1.TwitterAccount, facebook_account_entity_1.FacebookAccount, linkedin_account_entity_1.LinkedinAccount, post_entity_1.Post],
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, account_entity_1.Account, group_entity_1.Group, account_group_entity_1.AccountGroup, twitter_account_entity_1.TwitterAccount, facebook_account_entity_1.FacebookAccount, linkedin_account_entity_1.LinkedinAccount, post_entity_1.Post]),
            auth_module_1.AuthModule,
            group_module_1.GroupModule,
            account_module_1.AccountModule,
            post_module_1.PostModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map