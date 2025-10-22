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
const auth_controller_1 = require("./controllers/auth.controller");
const twitter_controller_1 = require("./controllers/twitter.controller");
const group_controller_1 = require("./controllers/group.controller");
const account_controller_1 = require("./controllers/account.controller");
const post_controller_1 = require("./controllers/post.controller");
const linkedin_controller_1 = require("./controllers/linkedin.controller");
const facebook_controller_1 = require("./controllers/facebook.controller");
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
        ],
        controllers: [
            auth_controller_1.AuthController,
            twitter_controller_1.TwitterController,
            group_controller_1.GroupController,
            account_controller_1.AccountController,
            post_controller_1.PostController,
            linkedin_controller_1.LinkedinController,
            facebook_controller_1.FacebookController,
        ],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map