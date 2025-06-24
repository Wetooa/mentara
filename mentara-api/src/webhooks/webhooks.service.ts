// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/providers/prisma-client.provider';
// import { ConfigService } from '@nestjs/config';
// import { Webhook } from 'svix';
//
// @Injectable()
// export class WebhooksService {
//   constructor(
//     private prisma: PrismaService,
//     private configService: ConfigService,
//   ) {}
//
//   async validateWebhook(
//     headers: Record<string, string>,
//     payload: string,
//   ): Promise<any> {
//     const webhookSecret = this.configService.get<string>(
//       'CLERK_WEBHOOK_SECRET',
//     );
//
//     if (!webhookSecret) {
//       throw new Error('Missing CLERK_WEBHOOK_SECRET');
//     }
//
//     const svixId = headers['svix-id'];
//     const svixTimestamp = headers['svix-timestamp'];
//     const svixSignature = headers['svix-signature'];
//
//     if (!svixId || !svixTimestamp || !svixSignature) {
//       throw new Error('Missing Svix headers');
//     }
//
//     const webhook = new Webhook(webhookSecret);
//     return webhook.verify(payload, {
//       'svix-id': svixId,
//       'svix-timestamp': svixTimestamp,
//       'svix-signature': svixSignature,
//     });
//   }
//
//   async handleUserCreatedOrUpdated(eventData: any): Promise<void> {
//     const { id, first_name, last_name, email_addresses, image_url } =
//       eventData.data;
//
//     const primaryEmail = email_addresses?.find(
//       (email) => email.id === eventData.data.primary_email_address_id,
//     )?.email_address;
//
//     // Upsert (Create or update) user in the database
//     await this.prisma.user.upsert({
//       where: { clerkId: id },
//       update: {
//         firstName: first_name || '',
//         lastName: last_name || '',
//         email: primaryEmail || '',
//         avatarUrl: image_url || '',
//         updatedAt: new Date(),
//       },
//       create: {
//         clerkId: id,
//         firstName: first_name || '',
//         lastName: last_name || '',
//         email: primaryEmail || '',
//         avatarUrl: image_url || '',
//       },
//     });
//   }
//
//   async handleUserDeleted(eventData: any): Promise<void> {
//     const { id } = eventData.data;
//
//     // Delete the user from the database
//     await this.prisma.user
//       .delete({
//         where: { clerkId: id },
//       })
//       .catch((error) => {
//         if (error.code !== 'P2025') {
//           // Not found error code
//           throw error;
//         }
//       });
//   }
// }
