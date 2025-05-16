import { PrismaService } from 'src/providers/prisma-client.provider';
import { ConfigService } from '@nestjs/config';
export declare class WebhooksService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    validateWebhook(headers: Record<string, string>, payload: string): Promise<any>;
    handleUserCreatedOrUpdated(eventData: any): Promise<void>;
    handleUserDeleted(eventData: any): Promise<void>;
}
