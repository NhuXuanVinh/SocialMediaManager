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
exports.AccountGroup = void 0;
const typeorm_1 = require("typeorm");
const account_entity_1 = require("./account.entity");
const group_entity_1 = require("./group.entity");
let AccountGroup = class AccountGroup {
};
exports.AccountGroup = AccountGroup;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], AccountGroup.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], AccountGroup.prototype, "group_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account),
    (0, typeorm_1.JoinColumn)({ name: 'account_id', referencedColumnName: 'accountId' }),
    __metadata("design:type", account_entity_1.Account)
], AccountGroup.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.Group),
    (0, typeorm_1.JoinColumn)({ name: 'group_id', referencedColumnName: 'groupId' }),
    __metadata("design:type", group_entity_1.Group)
], AccountGroup.prototype, "group", void 0);
exports.AccountGroup = AccountGroup = __decorate([
    (0, typeorm_1.Entity)('account_groups')
], AccountGroup);
//# sourceMappingURL=account-group.entity.js.map