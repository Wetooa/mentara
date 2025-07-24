// Phase 9: Messaging System
// Creates conversations and messages

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { seedMessaging } from '../messaging.seed';

export async function runPhase09Messaging(
  prisma: PrismaClient,
  relationshipsData: any,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`💬 PHASE 9: Creating messaging system (${config} mode)...`);

  try {
    const existingCount = await prisma.conversation.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing conversations, skipping phase`);
      
      // Return existing data for next phases
      const existingConversations = await prisma.conversation.findMany();
      const existingMessages = await prisma.message.findMany();
      const existingUserBlocks = await prisma.userBlock.findMany();
      const existingTypingIndicators = await prisma.typingIndicator.findMany();
      
      return {
        success: true,
        message: `Found ${existingCount} existing conversations`,
        skipped: true,
        data: { 
          conversations: existingConversations, 
          messages: existingMessages,
          userBlocks: existingUserBlocks,
          typingIndicators: existingTypingIndicators 
        },
      };
    }

    // Get relationships and users from previous phases
    const relationships = relationshipsData?.relationships || [];
    const users = usersData?.users || [];

    if (relationships.length === 0) {
      return {
        success: false,
        message: 'No relationships found for messaging system creation',
      };
    }

    if (users.length === 0) {
      return {
        success: false,
        message: 'No users found for messaging system creation',
      };
    }

    // Create messaging system (conversations, messages, user blocks, typing indicators)
    const messagingResult = await seedMessaging(prisma, relationships, users);

    const conversations = messagingResult.conversations || [];
    const messages = messagingResult.messages || [];
    const userBlocks = messagingResult.blocks || [];
    const typingIndicators = messagingResult.typingIndicators || [];

    console.log(`✅ Phase 9 completed: Created ${conversations.length} conversations, ${messages.length} messages, ${userBlocks.length} user blocks, ${typingIndicators.length} typing indicators`);

    return {
      success: true,
      message: `Messaging system phase completed - ${conversations.length} conversations, ${messages.length} messages created`,
      data: { conversations, messages, userBlocks, typingIndicators },
    };

  } catch (error) {
    console.error('❌ Phase 9 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}