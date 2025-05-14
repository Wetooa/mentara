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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_provider_1 = require("../providers/prisma-client.provider");
let PostsService = class PostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.post.findMany({
            include: {
                user: true,
                community: true,
            },
        });
    }
    async findOne(id) {
        return this.prisma.post.findUnique({
            where: { id },
            include: {
                user: true,
                community: true,
                comments: true,
            },
        });
    }
    async create(data) {
        return this.prisma.post.create({
            data,
            include: {
                user: true,
                community: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.post.update({
            where: { id },
            data,
            include: {
                user: true,
                community: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.post.delete({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return this.prisma.post.findMany({
            where: {
                userId: userId,
            },
            include: {
                user: true,
                community: true,
            },
        });
    }
    async findByCommunityId(communityId) {
        return this.prisma.post.findMany({
            where: {
                communityId,
            },
            include: {
                user: true,
                community: true,
            },
        });
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_provider_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map