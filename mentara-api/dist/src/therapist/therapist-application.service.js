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
exports.TherapistApplicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_provider_1 = require("../providers/prisma-client.provider");
let TherapistApplicationService = class TherapistApplicationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { status, skip, take } = params;
        const where = {};
        if (status) {
            where.status = status;
        }
        const applications = await this.prisma.therapistApplication.findMany({
            where,
            orderBy: { submissionDate: 'desc' },
            skip: skip || 0,
            take: take || 100,
        });
        const total = await this.prisma.therapistApplication.count({ where });
        return { applications, total };
    }
    async findOne(id) {
        return this.prisma.therapistApplication.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.therapistApplication.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.therapistApplication.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.therapistApplication.delete({
            where: { id },
        });
    }
    async isUserAdmin(clerkUserId) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { clerkUserId },
        });
        return !!admin;
    }
};
exports.TherapistApplicationService = TherapistApplicationService;
exports.TherapistApplicationService = TherapistApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_provider_1.PrismaService])
], TherapistApplicationService);
//# sourceMappingURL=therapist-application.service.js.map