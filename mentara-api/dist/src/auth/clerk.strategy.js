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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkStrategy = void 0;
const backend_1 = require("@clerk/backend");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
let ClerkStrategy = class ClerkStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'clerk') {
    clerkClient;
    configService;
    constructor(clerkClient, configService) {
        super();
        this.clerkClient = clerkClient;
        this.configService = configService;
    }
    async validate(req) {
        const token = req.headers.authorization?.split(' ').pop();
        if (!token) {
            console.log('Authentication failed: No token provided in headers');
            console.log('Headers received:', req.headers);
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            console.log('Attempting to verify token...');
            const tokenPayload = await (0, backend_1.verifyToken)(token, {
                secretKey: this.configService.get('CLERK_SECRET_KEY'),
            });
            const user = await this.clerkClient.users.getUser(tokenPayload.sub);
            console.log('Token verified successfully for user:', tokenPayload.sub);
            return user;
        }
        catch (error) {
            console.error('Token validation error:', error);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.ClerkStrategy = ClerkStrategy;
exports.ClerkStrategy = ClerkStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ClerkClient')),
    __metadata("design:paramtypes", [typeof (_a = typeof backend_1.ClerkClient !== "undefined" && backend_1.ClerkClient) === "function" ? _a : Object, config_1.ConfigService])
], ClerkStrategy);
//# sourceMappingURL=clerk.strategy.js.map