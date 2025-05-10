import { RawBodyRequest } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Request } from 'express';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleClerkWebhook(headers: Record<string, string>, body: any, req: RawBodyRequest<Request>): Promise<{
        success: boolean;
    }>;
}
