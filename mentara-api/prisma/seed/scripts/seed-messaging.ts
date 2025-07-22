#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Reply message templates for realistic conversations
const replyTemplates = [
  "I understand what you're going through.",
  "Thank you for sharing that with me.",
  "That sounds really challenging.",
  "How are you feeling about that?",
  "I'm here to support you through this.",
  "That's a great insight.",
  "Let's explore that further next time.",
  "I'm proud of your progress.",
  "Take it one day at a time.",
  "What would you like to focus on?",
];

function generateReplyMessage(originalContent: string): string {
  return faker.helpers.arrayElement(replyTemplates);
}

async function createConversationMessages(conversation: any, participants: any[]) {
  console.log(`💬 Creating messages for conversation between participants...`);
  
  const messages: any[] = [];
  const messageCount = faker.number.int({ min: 5, max: 25 });

  for (let i = 0; i < messageCount; i++) {
    const sender = faker.helpers.arrayElement(participants);
    const messageType = faker.helpers.arrayElement(['TEXT', 'TEXT', 'TEXT', 'TEXT', 'IMAGE', 'AUDIO']); // Favor text messages
    
    // Generate message date (within the last month)
    const messageDate = faker.date.between({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    });

    let content: string;
    
    if (messageType === 'TEXT') {
      const textMessages = [
        "Hello! How are you feeling today?",
        "I've been working on the exercises you suggested.",
        "The breathing techniques really helped me yesterday.",
        "I had a good week overall, thanks for asking.",
        "Could we schedule our next session for next Tuesday?",
        "I wanted to share some progress I've made.",
        "Thank you for being so understanding and patient.",
        "I found that journaling technique very helpful.",
        "I'm looking forward to our next conversation.",
        "The mindfulness exercises have been making a difference.",
        "I have some concerns I'd like to discuss.",
        "Your guidance has been invaluable to me.",
        "I practiced the coping strategies we talked about.",
        "How often should I be doing these exercises?",
        "I feel like I'm making real progress now.",
      ];
      content = faker.helpers.arrayElement(textMessages);
    } else if (messageType === 'IMAGE') {
      content = 'Shared an image';
    } else {
      content = 'Sent a voice message';
    }

    try {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: sender.id,
          content,
          messageType,
          createdAt: messageDate,
          // Add attachments for non-text messages (using array fields)
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
    } catch (error) {
      console.log(`⚠️  Skipped message creation (likely duplicate)`);
    }
  }

  // Create some read receipts and reactions
  for (const message of messages.slice(0, Math.min(5, messages.length))) {
    try {
      // Read receipts (random participants mark messages as read)
      const readers = faker.helpers.arrayElements(
        participants.filter(p => p.id !== message.senderId),
        faker.number.int({ min: 0, max: participants.length - 1 })
      );
      
      for (const reader of readers) {
        await prisma.messageReadReceipt.create({
          data: {
            messageId: message.id,
            userId: reader.id,
            readAt: faker.date.between({
              from: message.createdAt,
              to: new Date(),
            }),
          },
        });
      }

      // Message reactions (emojis)
      if (faker.datatype.boolean({ probability: 0.3 })) {
        const reactor = faker.helpers.arrayElement(
          participants.filter(p => p.id !== message.senderId)
        );
        const emoji = faker.helpers.arrayElement(['👍', '❤️', '😊', '👏', '🙏']);
        
        await prisma.messageReaction.create({
          data: {
            messageId: message.id,
            userId: reactor.id,
            emoji,
          },
        });
      }
    } catch (error) {
      // Skip if read receipt/reaction already exists
    }
  }

  return messages;
}

async function main() {
  console.log('💬 Seeding Messaging System (Standalone)...');
  
  try {
    // Check if conversations already exist
    const existingConversations = await prisma.conversation.count();
    if (existingConversations > 0) {
      console.log(`ℹ️  Found ${existingConversations} existing conversations`);
      const answer = process.env.FORCE_SEED || 'n';
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('✅ Conversations already exist, skipping...');
        return;
      }
    }

    // Fetch required data from database
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      include: { client: true }
    });
    
    const therapists = await prisma.user.findMany({
      where: { role: 'therapist' },
      include: { therapist: true }
    });

    const relationships = await prisma.clientTherapist.findMany({
      include: {
        client: { include: { user: true } },
        therapist: { include: { user: true } }
      }
    });

    if (clients.length === 0 || therapists.length === 0) {
      console.log('⚠️  No clients or therapists found. Please run user seeding first.');
      return;
    }

    console.log(`📊 Found ${clients.length} clients and ${therapists.length} therapists`);
    console.log(`🤝 Found ${relationships.length} client-therapist relationships`);

    let conversationsCreated = 0;
    let messagesCreated = 0;

    // Create conversations based on existing relationships
    for (const relationship of relationships) {
      const participants = [relationship.client.user, relationship.therapist.user];
      
      try {
        // Create direct conversation
        const conversation = await prisma.conversation.create({
          data: {
            type: 'DIRECT',
            title: `${relationship.client.user.firstName} & ${relationship.therapist.user.firstName}`,
            lastMessageAt: faker.date.recent({ days: 7 }),
          },
        });

        // Create conversation participants
        for (const participant of participants) {
          await prisma.conversationParticipant.create({
            data: {
              conversationId: conversation.id,
              userId: participant.id,
              joinedAt: conversation.createdAt,
              lastReadAt: faker.date.recent({ days: 1 }),
              role: participant.role === 'therapist' ? 'MODERATOR' : 'MEMBER',
            },
          });
        }

        // Create messages for this conversation
        const messages = await createConversationMessages(conversation, participants);
        messagesCreated += messages.length;
        conversationsCreated++;

        console.log(`✅ Created conversation between ${relationship.client.user.firstName} and ${relationship.therapist.user.firstName} with ${messages.length} messages`);

      } catch (error) {
        console.log(`⚠️  Failed to create conversation for ${relationship.client.user.firstName} and ${relationship.therapist.user.firstName}:`, error.message);
      }
    }

    // Create some additional random conversations between clients and therapists (for those without relationships)
    const additionalConversations = Math.min(3, Math.max(0, clients.length - relationships.length));
    
    for (let i = 0; i < additionalConversations; i++) {
      const client = faker.helpers.arrayElement(clients);
      const therapist = faker.helpers.arrayElement(therapists);
      const participants = [client, therapist];
      
      // Check if conversation already exists
      const existingConv = await prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: [client.id, therapist.id] }
            }
          },
          type: 'DIRECT'
        }
      });

      if (existingConv) continue;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            type: 'DIRECT',
            title: `${client.firstName} & ${therapist.firstName}`,
            lastMessageAt: faker.date.recent({ days: 7 }),
          },
        });

        // Create participants
        for (const participant of participants) {
          await prisma.conversationParticipant.create({
            data: {
              conversationId: conversation.id,
              userId: participant.id,
              joinedAt: conversation.createdAt,
              lastReadAt: faker.date.recent({ days: 1 }),
              role: participant.role === 'therapist' ? 'MODERATOR' : 'MEMBER',
            },
          });
        }

        // Create messages
        const messages = await createConversationMessages(conversation, participants);
        messagesCreated += messages.length;
        conversationsCreated++;

        console.log(`✅ Created additional conversation between ${client.firstName} and ${therapist.firstName} with ${messages.length} messages`);

      } catch (error) {
        console.log(`⚠️  Failed to create additional conversation:`, error.message);
      }
    }

    console.log('\n🎉 Messaging system seeded successfully!');
    console.log('📈 Summary:');
    console.log(`   💬 Conversations created: ${conversationsCreated}`);
    console.log(`   📱 Messages created: ${messagesCreated}`);
    console.log(`   👥 Total participants: ${conversationsCreated * 2}`);

  } catch (error) {
    console.error('❌ Error seeding messaging system:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during messaging seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });