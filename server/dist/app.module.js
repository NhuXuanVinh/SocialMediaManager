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
const auth_controller_1 = require("./controllers/auth.controller");
const twitter_controller_1 = require("./controllers/twitter.controller");
const group_controller_1 = require("./controllers/group.controller");
const account_controller_1 = require("./controllers/account.controller");
const post_controller_1 = require("./controllers/post.controller");
const linkedin_controller_1 = require("./controllers/linkedin.controller");
const facebook_controller_1 = require("./controllers/facebook.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
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