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
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findAll(userId) {
        return this.prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                files: true,
                hearts: userId
                    ? {
                        where: {
                            userId,
                        },
                    }
                    : false,
                _count: {
                    select: {
                        comments: true,
                        hearts: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, userId) {
        return this.prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                files: true,
                hearts: userId
                    ? {
                        where: {
                            userId,
                        },
                    }
                    : false,
                _count: {
                    select: {
                        comments: true,
                        hearts: true,
                    },
                },
            },
        });
    }
    async create(data) {
        return this.prisma.post.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                files: true,
            },
        });
    }
    async update(id, data, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own posts');
        }
        return this.prisma.post.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                files: true,
            },
        });
    }
    async remove(id, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own posts');
        }
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
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                files: true,
                _count: {
                    select: {
                        comments: true,
                        hearts: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByCommunityId(communityId, userId) {
        return this.prisma.post.findMany({
            where: {
                communityId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                files: true,
                hearts: userId
                    ? {
                        where: {
                            userId,
                        },
                    }
                    : false,
                _count: {
                    select: {
                        comments: true,
                        hearts: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async heartPost(postId, userId) {
        const existingHeart = await this.prisma.postHeart.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        if (existingHeart) {
            await this.prisma.postHeart.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId,
                    },
                },
            });
            return { hearted: false };
        }
        else {
            await this.prisma.postHeart.create({
                data: {
                    postId,
                    userId,
                },
            });
            return { hearted: true };
        }
    }
    async isPostHeartedByUser(postId, userId) {
        const heart = await this.prisma.postHeart.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        return !!heart;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_provider_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map