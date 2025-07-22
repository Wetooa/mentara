const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugCheckUser() {
  console.log('🔍 Debugging messaging issue for fake_client_test_1...\n');
  
  try {
    // 1. Check if fake_client_test_1 exists
    console.log('1️⃣ Checking if fake_client_test_1 user exists...');
    const user = await prisma.user.findUnique({
      where: { email: 'test.client.basic@mentaratest.dev' },
      include: {
        client: true
      }
    });
    
    if (!user) {
      console.log('❌ User fake_client_test_1 does NOT exist!');
      return;
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Client record exists: ${user.client ? 'Yes' : 'No'}`);
    
    // 2. Check ClientTherapist relationships
    console.log('\n2️⃣ Checking ClientTherapist relationships...');
    const relationships = await prisma.clientTherapist.findMany({
      where: { clientId: user.id },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    console.log(`   Found ${relationships.length} therapist relationships:`);
    relationships.forEach((rel, index) => {
      console.log(`   ${index + 1}. ${rel.therapist.user.firstName} ${rel.therapist.user.lastName} (${rel.therapist.user.email})`);
    });
    
    // 3. Check Conversations
    console.log('\n3️⃣ Checking Conversations...');
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
        isActive: true,
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: { isDeleted: false },
        },
      }
    });
    
    console.log(`   Found ${conversations.length} conversations:`);
    conversations.forEach((conv, index) => {
      const otherParticipants = conv.participants.filter(p => p.userId !== user.id);
      console.log(`   ${index + 1}. ${conv.type} conversation with:`);
      otherParticipants.forEach(p => {
        console.log(`      - ${p.user.firstName} ${p.user.lastName} (${p.user.role})`);
      });
      console.log(`      Messages: ${conv.messages.length > 0 ? conv.messages[0].content.substring(0, 50) + '...' : 'No messages'}`);
    });
    
    // 4. Check ConversationParticipant entries
    console.log('\n4️⃣ Checking ConversationParticipant entries...');
    const participantEntries = await prisma.conversationParticipant.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        conversation: {
          select: {
            id: true,
            type: true,
            title: true,
            isActive: true
          }
        }
      }
    });
    
    console.log(`   Found ${participantEntries.length} active participant entries:`);
    participantEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. Conversation: ${entry.conversation.title || 'Untitled'} (${entry.conversation.type})`);
      console.log(`      Role: ${entry.role}, Active: ${entry.isActive}, Conversation Active: ${entry.conversation.isActive}`);
    });
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   User exists: ✅`);
    console.log(`   ClientTherapist relationships: ${relationships.length}`);
    console.log(`   Conversations: ${conversations.length}`);
    console.log(`   Active participant entries: ${participantEntries.length}`);
    
    if (relationships.length === 0) {
      console.log('\n🚨 ISSUE IDENTIFIED: No ClientTherapist relationships found!');
    }
    
    if (conversations.length === 0) {
      console.log('\n🚨 ISSUE IDENTIFIED: No conversations found!');
    }
    
  } catch (error) {
    console.error('❌ Error during debug check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCheckUser().catch(console.error);