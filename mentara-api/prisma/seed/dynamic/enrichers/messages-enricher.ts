/**
 * Messages Enricher
 * Ensures users have conversations with minimum messages
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class MessagesEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Message');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure users have minimum conversations
    const users = await this.prisma.user.findMany({
      where: { role: { in: ['client', 'therapist'] } },
    });

    for (const user of users) {
      try {
        added += await this.ensureUserHasConversations(user.id, 2, 5);
      } catch (error) {
        errors++;
      }
    }

    return {
      table: this.tableName,
      itemsAdded: added,
      itemsUpdated: 0,
      errors,
    };
  }

  async ensureUserHasConversations(
    userId: string,
    minConversations: number,
    minMessagesPerConversation: number,
  ): Promise<number> {
    const existingConversations =
      await this.prisma.conversationParticipant.count({
        where: { userId },
      });

    const missing = minConversations - existingConversations;
    if (missing <= 0) return 0;

    // Get potential conversation partners
    const otherUsers = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        role: { in: ['client', 'therapist'] },
      },
      take: missing,
    });

    let messagesAdded = 0;

    for (const partner of otherUsers) {
      // Check if conversation already exists
      const existing = await this.prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: [userId, partner.id] },
            },
          },
        },
      });

      if (existing) continue;

      // Create conversation
      const conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId }, { userId: partner.id }],
          },
        },
      });

      // Add messages
      const templates = this.getMessageTemplates();
      const random = this.getRandom(conversation.id, 'messages');

      for (let i = 0; i < minMessagesPerConversation; i++) {
        const senderId = i % 2 === 0 ? userId : partner.id;
        const template = templates[i % templates.length];

        await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId,
            content: template,
            createdAt: this.randomPastDate(30),
          },
        });
        messagesAdded++;
      }
    }

    return messagesAdded;
  }

  private getMessageTemplates(): string[] {
    return [
      'Hi! How are you doing today?',
      "I'm doing well, thanks for asking. How about you?",
      'I wanted to check in about our upcoming session.',
      "Sure, I'm available at that time.",
      'Great! Looking forward to it.',
      'Have you had a chance to review the worksheet?',
      "Yes, I've been working on it. It's been really helpful!",
      'How have you been feeling this week?',
      'Things have been getting better, thank you for asking.',
      'Let me know if you need anything else!',
    ];
  }
}
