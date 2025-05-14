// import {
//   Controller,
//   Post,
//   Headers,
//   Body,
//   HttpCode,
//   HttpStatus,
//   HttpException,
//   RawBodyRequest,
// } from '@nestjs/common';
// import { WebhooksService } from './webhooks.service';
// import { Public } from 'src/decorators/public.decorator';
// import { Request } from 'express';
//
// @Controller('webhooks')
// export class WebhooksController {
//   constructor(private readonly webhooksService: WebhooksService) {}
//
//   @Public()
//   @Post('clerk')
//   @HttpCode(HttpStatus.OK)
//   async handleClerkWebhook(
//     @Headers() headers: Record<string, string>,
//     @Body() body: any,
//     req: RawBodyRequest<Request>,
//   ) {
//     try {
//       // Get the raw body for webhook verification
//       const rawBody = req.rawBody?.toString() || JSON.stringify(body);
//
//       // Verify webhook signature
//       const event = await this.webhooksService.validateWebhook(
//         headers,
//         rawBody,
//       );
//
//       // Handle events based on type
//       switch (event.type) {
//         case 'user.created':
//         case 'user.updated':
//           await this.webhooksService.handleUserCreatedOrUpdated(event);
//           break;
//         case 'user.deleted':
//           await this.webhooksService.handleUserDeleted(event);
//           break;
//         // Add more event types as needed
//       }
//
//       return { success: true };
//     } catch (error) {
//       console.error('Webhook Error:', error);
//       throw new HttpException(
//         `Webhook processing error: ${error.message}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
// }
