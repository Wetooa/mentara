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
exports.AuthService = void 0;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const common_1 = require("@nestjs/common");
const prisma_1 = require("../../lib/prisma");
const current_user_decorator_1 = require("src/decorators/current-user.decorator");
let AuthService = class AuthService {
    async getUsers() {
        return clerk_sdk_node_1.clerkClient.users.getUserList();
    }
    async getUser(userId) {
        return clerk_sdk_node_1.clerkClient.users.getUser(userId);
    }
    async checkAdmin(userId) {
        try {
            const adminUser = await prisma_1.default.adminUser.findUnique({
                where: { id: userId },
            });
            if (!adminUser) {
                throw new common_1.ForbiddenException('Not authorized as admin');
            }
            return {
                success: true,
                admin: {
                    id: adminUser.id,
                    role: adminUser.role,
                    permissions: adminUser.permissions,
                },
            };
        }
        catch (error) {
            console.error('Admin authentication error:', error);
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Authentication failed');
        }
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "checkAdmin", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map