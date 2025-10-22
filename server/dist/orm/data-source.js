"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.ensureDataSourceInitialized = ensureDataSourceInitialized;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const user_entity_1 = require("../entities/user.entity");
const account_entity_1 = require("../entities/account.entity");
const group_entity_1 = require("../entities/group.entity");
const account_group_entity_1 = require("../entities/account-group.entity");
const twitter_account_entity_1 = require("../entities/twitter-account.entity");
const facebook_account_entity_1 = require("../entities/facebook-account.entity");
const linkedin_account_entity_1 = require("../entities/linkedin-account.entity");
const post_entity_1 = require("../entities/post.entity");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [user_entity_1.User, account_entity_1.Account, group_entity_1.Group, account_group_entity_1.AccountGroup, twitter_account_entity_1.TwitterAccount, facebook_account_entity_1.FacebookAccount, linkedin_account_entity_1.LinkedinAccount, post_entity_1.Post],
    synchronize: true,
    logging: false,
});
async function ensureDataSourceInitialized() {
    if (!exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.initialize();
    }
    return exports.AppDataSource;
}
//# sourceMappingURL=data-source.js.map