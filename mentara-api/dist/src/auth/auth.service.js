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
exports.AuthService = void 0;
const backend_1 = require("@clerk/backend");
const common_1 = require("@nestjs/common");
const prisma_client_provider_1 = require("../providers/prisma-client.provider");
let AuthService = class AuthService {
    prisma;
    clerkClient = (0, backend_1.createClerkClient)({
        secretKey: process.env.CLERK_SECRET_KEY,
    });
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkAdmin(id) {
        const admin = await this.prisma.user.findUnique({
            where: { role: 'admin', id },
        });
        return !!admin;
    }
    async registerClient(userId, registerClientDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User already exists');
            }
            await this.clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    role: 'client',
                },
            });
            await this.prisma.user.create({
                data: registerClientDto.user.create,
            });
            const client = await this.prisma.client.create({
                data: {
                    ...registerClientDto,
                    user: { connect: { id: userId } },
                },
                include: {
                    user: true,
                    worksheets: true,
                    preAssessment: true,
                    worksheetSubmissions: true,
                    clientMedicalHistory: true,
                    clientPreferences: true,
                    assignedTherapists: true,
                    meetings: true,
                },
            });
            return client;
        }
        catch (error) {
            console.error('User registration error:', error instanceof Error ? error.message : error);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('User registration failed');
        }
    }
    async registerTherapist(userId, registerTherapistDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User already exists');
            }
            await this.clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    role: 'therapist',
                },
            });
            await this.prisma.user.create({
                data: registerTherapistDto.user.create,
            });
            await this.prisma.therapist.create({
                data: {
                    approved: false,
                    status: 'pending',
                    ...registerTherapistDto,
                },
                include: {
                    user: true,
                    assignedClients: true,
                    meetings: true,
                    therapistAvailabilities: true,
                },
            });
            return await this.prisma.therapist.findUniqueOrThrow({
                where: { userId },
                include: {
                    user: true,
                    assignedClients: true,
                    meetings: true,
                    therapistAvailabilities: true,
                    worksheets: true,
                },
            });
        }
        catch (error) {
            console.error('Therapist registration error:', error instanceof Error ? error.message : error);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Therapist registration failed');
        }
    }
    async getUsers() {
        return this.clerkClient.users.getUserList();
    }
    async getUser(userId) {
        return this.clerkClient.users.getUser(userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_provider_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map