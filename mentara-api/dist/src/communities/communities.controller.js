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
exports.CommunitiesController = void 0;
const common_1 = require("@nestjs/common");
const communities_service_1 = require("./communities.service");
const client_1 = require("@prisma/client");
let CommunitiesController = class CommunitiesController {
    communitiesService;
    constructor(communitiesService) {
        this.communitiesService = communitiesService;
    }
    async findAll() {
        try {
            return await this.communitiesService.findAll();
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fetch communities: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const community = await this.communitiesService.findOne(id);
            if (!community) {
                throw new common_1.HttpException('Community not found', common_1.HttpStatus.NOT_FOUND);
            }
            return community;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fetch community: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(communityData) {
        try {
            return await this.communitiesService.create(communityData);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create community: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, communityData) {
        try {
            return await this.communitiesService.update(id, communityData);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to update community: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            return await this.communitiesService.remove(id);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete community: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findByUserId(userId) {
        try {
            return await this.communitiesService.findByUserId(userId);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fetch communities for user: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CommunitiesController = CommunitiesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommunitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunitiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunitiesController.prototype, "findByUserId", null);
exports.CommunitiesController = CommunitiesController = __decorate([
    (0, common_1.Controller)('communities'),
    __metadata("design:paramtypes", [communities_service_1.CommunitiesService])
], CommunitiesController);
//# sourceMappingURL=communities.controller.js.map