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
exports.CommunitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_provider_1 = require("../providers/prisma-client.provider");
let CommunitiesService = class CommunitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.community.findMany();
    }
    async findOne(id) {
        return this.prisma.community.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.community.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.community.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.community.delete({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return this.prisma.community.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
        });
    }
};
exports.CommunitiesService = CommunitiesService;
exports.CommunitiesService = CommunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_provider_1.PrismaService])
], CommunitiesService);
//# sourceMappingURL=communities.service.js.map