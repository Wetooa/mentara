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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const clerk_auth_guard_1 = require("../clerk-auth.guard");
const current_user_id_decorator_1 = require("../decorators/current-user-id.decorator");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async registerClient(id, registerUserDto) {
        return await this.authService.registerClient(id, registerUserDto);
    }
    async registerTherapist(id, registerTherapistDto) {
        return await this.authService.registerTherapist(id, registerTherapistDto);
    }
    async getMe(id) {
        return await this.authService.getUser(id);
    }
    async getAllUsers() {
        return await this.authService.getUsers();
    }
    checkAdmin(id) {
        return this.authService.checkAdmin(id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Post)('register/client'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerClient", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Post)('register/therapist'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerTherapist", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Post)('is-admin'),
    __param(0, (0, current_user_id_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAdmin", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map