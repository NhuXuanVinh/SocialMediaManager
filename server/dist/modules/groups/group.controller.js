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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("./group.service");
let GroupController = class GroupController {
    constructor(groupService) {
        this.groupService = groupService;
    }
    async create(body, res) {
        try {
            const { userId, name } = body;
            const group = await this.groupService.createGroup(Number(userId), name);
            return res.status(201).json({ message: 'Group created successfully', group });
        }
        catch (err) {
            return res.status(500).json({ message: err.message || 'Error creating group' });
        }
    }
    async addAccount(body, res) {
        try {
            const { groupId, accountId } = body;
            await this.groupService.addAccountToGroup(Number(groupId), Number(accountId));
            return res.status(200).json({ message: 'Account added to group successfully' });
        }
        catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
            return res.status(status).json({ message: err.message || 'Error adding account to group' });
        }
    }
    async removeAccount(body, res) {
        try {
            const { groupId, accountId } = body;
            await this.groupService.removeAccountFromGroup(Number(groupId), Number(accountId));
            return res.status(200).json({ message: 'Account removed from group successfully' });
        }
        catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
            return res.status(status).json({ message: err.message || 'Error removing account from group' });
        }
    }
    async getByUser(userId, res) {
        try {
            const groups = await this.groupService.getGroupsByUser(Number(userId));
            return res.status(200).json({ groups: groups || [] });
        }
        catch (err) {
            return res.status(500).json({ message: 'Error fetching groups for user' });
        }
    }
    async getById(groupId, res) {
        try {
            const group = await this.groupService.getGroupById(Number(groupId));
            return res.status(200).json({ group });
        }
        catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
            return res.status(status).json({ message: err.message || 'Server error' });
        }
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('add-account'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "addAccount", null);
__decorate([
    (0, common_1.Post)('remove-account'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "removeAccount", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Get)('find/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getById", null);
exports.GroupController = GroupController = __decorate([
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map