// Messaging Seed Module
// Handles creation of conversations, messages, and related messaging data

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

export async function seedMessaging(
  prisma: PrismaClient,
  relationships: any[],
  allUsers: any[]
) {
  console.log('💬 Creating messaging data...');

  const conversations: any[] = [];
  const messages: any[] = [];

  // Create direct conversations for client-therapist relationships
  for (const { relationship, client, therapist } of relationships) {
    try {
      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          title: `${client.user.firstName} & ${therapist.user.firstName}`,
          isActive: true,
          lastMessageAt: faker.date.recent({ days: 30 }),
        },
      });
      conversations.push(conversation);

      // Add participants
      await prisma.conversationParticipant.createMany({
        data: [
          {
            conversationId: conversation.id,
            userId: client.user.id,
            joinedAt: relationship.assignedAt,
            role: 'MEMBER',
            lastReadAt: faker.date.recent({ days: 7 }),
          },
          {
            conversationId: conversation.id,
            userId: therapist.user.id,
            joinedAt: relationship.assignedAt,
            role: 'MEMBER',
            lastReadAt: faker.date.recent({ days: 7 }),
          },
        ],
      });

      // Create conversation messages
      const messageCount = SEED_CONFIG.MESSAGING.MESSAGES_PER_CONVERSATION;
      const conversationMessages = await createConversationMessages(
        prisma,
        conversation,
        client.user,
        therapist.user,
        messageCount,
        relationship.assignedAt
      );
      messages.push(...conversationMessages);

      console.log(
        `✅ Created conversation between ${client.user.firstName} and ${therapist.user.firstName} with ${messageCount} messages`
      );
    } catch (error) {
      console.error(
        `Failed to create conversation for ${client.user.firstName} and ${therapist.user.firstName}:`,
        error
      );
    }
  }

  // Create some group conversations for community support
  const communitySupportCount = Math.min(3, Math.floor(allUsers.length / 10));
  for (let i = 0; i < communitySupportCount; i++) {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          type: 'GROUP',
          title: `Community Support Group ${i + 1}`,
          isActive: true,
          lastMessageAt: faker.date.recent({ days: 7 }),
        },
      });
      conversations.push(conversation);

      // Add 3-6 random participants
      const participantCount = faker.number.int({ min: 3, max: 6 });
      const participants = faker.helpers.arrayElements(allUsers, participantCount);
      
      for (const participant of participants) {
        await prisma.conversationParticipant.create({
          data: {
            conversationId: conversation.id,
            userId: participant.id,
            joinedAt: faker.date.past({ years: 1 }),
            role: faker.helpers.arrayElement(['MEMBER', 'MEMBER', 'MODERATOR']),
            lastReadAt: faker.date.recent({ days: 3 }),
          },
        });
      }

      // Create group messages
      const groupMessageCount = SEED_CONFIG.MESSAGING.MESSAGES_PER_CONVERSATION;
      const groupMessages = await createGroupMessages(
        prisma,
        conversation,
        participants,
        groupMessageCount
      );
      messages.push(...groupMessages);

      console.log(
        `✅ Created group conversation "${conversation.title}" with ${participants.length} participants and ${groupMessageCount} messages`
      );
    } catch (error) {
      console.error(`Failed to create group conversation ${i + 1}:`, error);
    }
  }

  // Add read receipts and reactions to recent messages
  await addMessageEngagement(prisma, messages);

  // Add user blocking relationships
  const blocks = await seedUserBlocks(prisma, allUsers);

  // Add typing indicators for active conversations
  const typingIndicators = await seedTypingIndicators(prisma, conversations, allUsers);

  return { conversations, messages, blocks, typingIndicators };
}

async function createConversationMessages(
  prisma: PrismaClient,
  conversation: any,
  client: any,
  therapist: any,
  messageCount: number,
  startDate: Date
) {
  const messages: any[] = [];
  const participants = [client, therapist];

  // Create initial system message for relationship establishment
  const systemMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: therapist.id,
      content: `Hi ${client.firstName}! I'm excited to start working with you. Please feel free to reach out anytime you have questions or need support.`,
      messageType: 'SYSTEM',
      createdAt: startDate,
    },
  });
  messages.push(systemMessage);

  // Create conversation flow over time
  for (let i = 1; i < messageCount; i++) {
    const sender = faker.helpers.arrayElement(participants);
    const messageDate = faker.date.between({
      from: startDate,
      to: new Date(),
    });

    let content: string;
    let messageType: 'TEXT' | 'IMAGE' | 'AUDIO' = 'TEXT';

    // Generate realistic therapy conversation content
    if (sender.id === therapist.id) {
      content = generateTherapistMessage();
    } else {
      content = generateClientMessage();
    }

    // Occasionally add non-text messages
    if (faker.datatype.boolean({ probability: 0.1 })) {
      messageType = faker.helpers.arrayElement(['IMAGE', 'AUDIO']);
      if (messageType === 'IMAGE') {
        content = 'Shared an image';
      } else {
        content = 'Sent a voice message';
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,
        content,
        messageType,
        createdAt: messageDate,
        // Add some attachments for non-text messages (using array fields)
        ...(messageType === 'IMAGE' && {
          attachmentUrls: [faker.image.url()],
          attachmentNames: ['shared_image.jpg'],
          attachmentSizes: [faker.number.int({ min: 100000, max: 5000000 })],
        }),
        ...(messageType === 'AUDIO' && {
          attachmentUrls: [faker.internet.url() + '/voice.mp3'],
          attachmentNames: ['voice_message.mp3'],
          attachmentSizes: [faker.number.int({ min: 50000, max: 2000000 })],
        }),
      },
    });
    messages.push(message);

    // Occasionally create replies
    if (i > 3 && faker.datatype.boolean({ probability: 0.15 })) {
      const replyToMessage = faker.helpers.arrayElement(messages.slice(-3));
      const replySender = participants.find(p => p.id !== replyToMessage.senderId);
      
      if (replySender) {
        const replyContent = generateReplyMessage(replyToMessage.content);
        const reply = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: replySender.id,
            content: replyContent,
            messageType: 'TEXT',
            replyToId: replyToMessage.id,
            createdAt: faker.date.between({
              from: messageDate,
              to: new Date(),
            }),
          },
        });
        messages.push(reply);
      }
    }
  }

  return messages;
}

async function createGroupMessages(
  prisma: PrismaClient,
  conversation: any,
  participants: any[],
  messageCount: number
) {
  const messages: any[] = [];

  // Create welcome system message
  const welcomeMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: participants[0].id,
      content: `Welcome to ${conversation.title}! This is a safe space for support and sharing.`,
      messageType: 'SYSTEM',
      createdAt: faker.date.past({ years: 1 }),
    },
  });
  messages.push(welcomeMessage);

  // Create group conversation messages
  for (let i = 1; i < messageCount; i++) {
    const sender = faker.helpers.arrayElement(participants);
    const content = generateGroupSupportMessage();
    
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,
        content,
        messageType: 'TEXT',
        createdAt: faker.date.past({ years: 0.5 }),
      },
    });
    messages.push(message);
  }

  return messages;
}

async function addMessageEngagement(prisma: PrismaClient, messages: any[]) {
  console.log('💝 Adding message engagement (read receipts and reactions)...');

  // Add read receipts to recent messages
  const recentMessages = messages
    .filter(msg => new Date(msg.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .slice(0, 50); // Limit to avoid too many operations

  for (const message of recentMessages) {
    try {
      // Get conversation participants
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: message.conversationId },
        include: { user: true },
      });

      // Add read receipts for some participants (not the sender)
      for (const participant of participants) {
        if (participant.userId !== message.senderId && faker.datatype.boolean({ probability: 0.7 })) {
          try {
            await prisma.messageReadReceipt.create({
              data: {
                messageId: message.id,
                userId: participant.userId,
                readAt: faker.date.between({
                  from: message.createdAt,
                  to: new Date(),
                }),
              },
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }

      // Add some emoji reactions
      if (faker.datatype.boolean({ probability: 0.3 })) {
        const reactionEmojis = ['❤️', '👍', '😊', '🙏', '💪', '🌟'];
        const emoji = faker.helpers.arrayElement(reactionEmojis);
        const reactor = faker.helpers.arrayElement(participants);
        
        if (reactor.userId !== message.senderId) {
          try {
            await prisma.messageReaction.create({
              data: {
                messageId: message.id,
                userId: reactor.userId,
                emoji,
              },
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    } catch (error) {
      // Continue with next message if this one fails
    }
  }
}

async function seedUserBlocks(prisma: PrismaClient, users: any[]) {
  console.log('🚫 Creating user blocking relationships...');

  const blocks: any[] = [];

  // Create a small number of blocks (about 2% of users block someone)
  const blockingUsers = faker.helpers.arrayElements(users, Math.ceil(users.length * 0.02));

  for (const blockingUser of blockingUsers) {
    // Each blocking user blocks 1-2 other users
    const blockCount = faker.number.int({ min: 1, max: 2 });
    const potentialBlockees = users.filter(u => u.id !== blockingUser.id);
    const blockedUsers = faker.helpers.arrayElements(potentialBlockees, blockCount);

    for (const blockedUser of blockedUsers) {
      try {
        const block = await prisma.userBlock.create({
          data: {
            blockerId: blockingUser.id,
            blockedId: blockedUser.id,
            reason: faker.helpers.arrayElement([
              'Inappropriate behavior',
              'Harassment',
              'Spam messages', 
              'Personal conflict',
              'Violation of community guidelines'
            ]),
          },
        });
        blocks.push(block);
      } catch (error) {
        // Skip if block already exists
      }
    }
  }

  console.log(`✅ Created ${blocks.length} user blocks`);
  return blocks;
}

async function seedTypingIndicators(prisma: PrismaClient, conversations: any[], users: any[]) {
  console.log('⌨️ Creating typing indicators for active conversations...');

  const typingIndicators: any[] = [];

  // Add typing indicators to recent conversations (simulate current typing)
  const recentConversations = conversations
    .filter(conv => new Date(conv.lastMessageAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    .slice(0, 10); // Limit to most recent 10 conversations

  for (const conversation of recentConversations) {
    // Get participants
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: conversation.id },
    });

    // Randomly add typing indicators for some participants
    if (faker.datatype.boolean({ probability: 0.3 })) {
      const typingUser = faker.helpers.arrayElement(participants);
      
      try {
        const typingIndicator = await prisma.typingIndicator.create({
          data: {
            conversationId: conversation.id,
            userId: typingUser.userId,
            lastTypingAt: faker.date.recent({ days: 1 }),
          },
        });
        typingIndicators.push(typingIndicator);
      } catch (error) {
        // Skip if indicator already exists
      }
    }
  }

  console.log(`✅ Created ${typingIndicators.length} typing indicators`);
  return typingIndicators;
}

function generateTherapistMessage(): string {
  const messages = [
    "How are you feeling today? I'd love to hear about your progress since our last session.",
    "That sounds like a really positive step forward. How did that make you feel?",
    "Thank you for sharing that with me. It takes courage to be so open about your experiences.",
    "I can see you've been working hard on the goals we discussed. What has been most helpful for you?",
    "Remember that progress isn't always linear. It's okay to have setbacks - they're part of the journey.",
    "I'm proud of the work you're doing. How can I best support you this week?",
    "That's a great insight. How might you apply this understanding in your daily life?",
    "I notice you mentioned feeling overwhelmed. Can we explore some coping strategies together?",
    "Your commitment to healing is inspiring. What would you like to focus on in our next session?",
    "I appreciate you reaching out. It shows great self-awareness and strength.",
  ];
  return faker.helpers.arrayElement(messages);
}

function generateClientMessage(): string {
  const messages = [
    "I've been having a tough few days and wanted to check in.",
    "Thank you for your support. It really means a lot to me.",
    "I tried the breathing exercise you suggested and it helped during my anxiety episode.",
    "I had a breakthrough moment yesterday and wanted to share it with you.",
    "I'm struggling with motivation today. Do you have any suggestions?",
    "The homework assignment was really helpful. I learned a lot about myself.",
    "I've been practicing mindfulness and notice I'm sleeping better.",
    "I'm feeling more confident in social situations lately.",
    "Can we talk about some strategies for managing stress at work?",
    "I appreciate having someone to talk to who understands what I'm going through.",
  ];
  return faker.helpers.arrayElement(messages);
}

function generateGroupSupportMessage(): string {
  const messages = [
    "Thank you all for being such a supportive community. You've helped me through so much.",
    "I wanted to share a small victory today - I finally felt comfortable in a social situation!",
    "Having a rough day today. Any suggestions for self-care activities?",
    "Just wanted to check in and see how everyone is doing.",
    "I found this article really helpful and thought I'd share it with the group.",
    "Remember that it's okay to have bad days. Tomorrow is a new opportunity.",
    "Grateful for this safe space where I can be myself without judgment.",
    "Does anyone have experience with meditation apps? Looking for recommendations.",
    "Sending positive vibes to everyone in the group today! 🌟",
    "Your stories inspire me to keep working on my own healing journey.",
  ];
  return faker.helpers.arrayElement(messages);
}

function generateReplyMessage(originalContent: string): string {
  const replies = [
    "Thank you for sharing that.",
    "I really relate to what you're saying.",
    "That's a great point.",
    "I appreciate your perspective on this.",
    "That makes a lot of sense.",
    "Thank you for the encouragement.",
    "I hadn't thought about it that way before.",
    "That's really helpful advice.",
  ];
  return faker.helpers.arrayElement(replies);
}