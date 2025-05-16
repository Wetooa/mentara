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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_provider_1 = require("../providers/prisma-client.provider");
const config_1 = require("@nestjs/config");
const svix_1 = require("svix");
let WebhooksService = class WebhooksService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async validateWebhook(headers, payload) {
        const webhookSecret = this.configService.get('CLERK_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('Missing CLERK_WEBHOOK_SECRET');
        }
        const svixId = headers['svix-id'];
        const svixTimestamp = headers['svix-timestamp'];
        const svixSignature = headers['svix-signature'];
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new Error('Missing Svix headers');
        }
        const webhook = new svix_1.Webhook(webhookSecret);
        return webhook.verify(payload, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        });
    }
    async handleUserCreatedOrUpdated(eventData) {
        const { id, first_name, last_name, email_addresses, image_url } = eventData.data;
        const primaryEmail = email_addresses?.find((email) => email.id === eventData.data.primary_email_address_id)?.email_address;
        const existingUser = primaryEmail
            ? await this.prisma.user.findUnique({
                where: { id: primaryEmail },
            })
            : null;
        if (existingUser) {
            await this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    firstName: first_name || '',
                    lastName: last_name || '',
                    updatedAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.user.create({
                data: {
                    firstName: first_name || '',
                    lastName: last_name || '',
                    middleName: '',
                    birthDate: new Date(),
                    address: 'Not provided',
                },
            });
        }
    }
    async handleUserDeleted(eventData) {
        const { id, email_addresses } = eventData.data;
        if (email_addresses && email_addresses.length > 0) {
            const primaryEmail = email_addresses[0].email_address;
            const user = await this.prisma.user.findFirst({
                where: {
                    firstName: { contains: primaryEmail, mode: 'insensitive' },
                },
            });
            if (user) {
                await this.prisma.user.delete({
                    where: { id: user.id },
                });
            }
        }
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_provider_1.PrismaService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map