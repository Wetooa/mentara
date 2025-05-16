import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async validateWebhook(
    headers: Record<string, string>,
    payload: string,
  ): Promise<any> {
    const webhookSecret = this.configService.get<string>(
      'CLERK_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET');
    }

    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new Error('Missing Svix headers');
    }

    const webhook = new Webhook(webhookSecret);
    return webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  }

  async handleUserCreatedOrUpdated(eventData: any): Promise<void> {
    const { id, first_name, last_name, email_addresses, image_url } =
      eventData.data;

    const primaryEmail = email_addresses?.find(
      (email) => email.id === eventData.data.primary_email_address_id,
    )?.email_address;

    // Find the user by a unique identifier like email from Clerk
    const existingUser = primaryEmail
      ? await this.prisma.user.findUnique({
          where: { id: primaryEmail }, // Using primary email as a fallback identifier
        })
      : null;

    if (existingUser) {
      // Update existing user
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: first_name || '',
          lastName: last_name || '',
          // Store other Clerk data in existing fields or just update the fields you can
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user with required fields
      await this.prisma.user.create({
        data: {
          firstName: first_name || '',
          lastName: last_name || '',
          middleName: '', // Optional in our updated schema
          birthDate: new Date(), // Required field, default to current date
          address: 'Not provided', // Required field, default placeholder
          // Other required fields from your schema
        },
      });
    }
  }

  async handleUserDeleted(eventData: any): Promise<void> {
    const { id, email_addresses } = eventData.data;

    // Try to find a user by email if available
    if (email_addresses && email_addresses.length > 0) {
      const primaryEmail = email_addresses[0].email_address;

      // Find the user by email
      const user = await this.prisma.user.findFirst({
        where: {
          firstName: { contains: primaryEmail, mode: 'insensitive' },
        },
      });

      if (user) {
        // Delete the user from the database
        await this.prisma.user.delete({
          where: { id: user.id },
        });
      }
    }
  }
}
