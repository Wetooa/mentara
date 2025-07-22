// Quick database check to validate enhanced seeding volumes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseCounts() {
  try {
    console.log('🔍 Checking database entity counts after enhanced seeding...\n');

    // Check user counts by role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    console.log('👥 User Counts by Role:');
    userCounts.forEach(({ role, _count }) => {
      console.log(`   ${role}: ${_count.id}`);
    });

    // Check specific entities 
    const clientCount = await prisma.client.count();
    const therapistCount = await prisma.therapist.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    const worksheetCount = await prisma.worksheet.count();
    const meetingCount = await prisma.meeting.count();
    const relationshipCount = await prisma.clientTherapist.count(); // Fixed model name
    const communityCount = await prisma.community.count();
    const messageCount = await prisma.message.count();

    console.log('\n📊 Entity Counts:');
    console.log(`   👤 Clients: ${clientCount}`);
    console.log(`   🩺 Therapists: ${therapistCount}`);
    console.log(`   🏘️  Communities: ${communityCount}`);
    console.log(`   🤝 Client-Therapist Relationships: ${relationshipCount}`);
    console.log(`   📅 Meetings: ${meetingCount}`);
    console.log(`   📝 Posts: ${postCount}`);
    console.log(`   💬 Comments: ${commentCount}`);
    console.log(`   💬 Messages: ${messageCount}`);
    console.log(`   📚 Worksheets: ${worksheetCount}`);

    // Expected vs Actual comparison
    console.log('\n🎯 Expected vs Actual (based on SEED_CONFIG):');
    console.log(`   👤 Clients: Expected ~75, Got ${clientCount}`);
    console.log(`   🩺 Therapists: Expected ~35, Got ${therapistCount}`);
    console.log(`   📝 Posts: Expected ~${communityCount * 15}, Got ${postCount}`);
    console.log(`   💬 Comments: Expected ~${postCount * 8}, Got ${commentCount}`);

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseCounts();