/**
 * Message Interactions Enricher
 * Ensures messages have reactions and read receipts
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class MessageInteractionsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'MessageReaction');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Add reactions to some messages (not all)
    const messages = await this.prisma.message.findMany({
      where: {
        reactions: {
          none: {},
        },
      },
      take: 50,
      include: { conversation: { include: { participants: true } } },
    });

    for (const message of messages) {
      try {
        const random = this.getRandom(message.id, 'reactions');
        // 30% chance of reaction
        if (random.next() < 0.3) {
          added += await this.addReactionToMessage(message);
        }

        // 70% chance of read receipt
        if (random.next() < 0.7) {
          added += await this.addReadReceipt(message);
        }
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

  private async addReactionToMessage(message: any): Promise<number> {
    // Get conversation participants (excluding sender)
    const participants = message.conversation.participants.filter(
      (p: any) => p.userId !== message.senderId,
    );

    if (participants.length === 0) return 0;

    const random = this.getRandom(message.id, 'reaction-user');
    const reactor = participants[random.nextInt(participants.length)];

    const emojis = ['👍', '❤️', '😊', '🙏', '👏'];

    await this.prisma.messageReaction.create({
      data: {
        messageId: message.id,
        userId: reactor.userId,
        emoji: emojis[random.nextInt(emojis.length)],
        createdAt: this.randomDateAfter(message.createdAt, 1),
      },
    });

    return 1;
  }

  private async addReadReceipt(message: any): Promise<number> {
    // Get conversation participants (excluding sender)
    const participants = message.conversation.participants.filter(
      (p: any) => p.userId !== message.senderId,
    );

    if (participants.length === 0) return 0;

    const random = this.getRandom(message.id, 'read-receipt');

    for (const participant of participants) {
      await this.prisma.messageReadReceipt.create({
        data: {
          messageId: message.id,
          userId: participant.userId,
          readAt: this.randomDateAfter(message.createdAt, 2),
        },
      });
    }

    return participants.length;
  }
}
