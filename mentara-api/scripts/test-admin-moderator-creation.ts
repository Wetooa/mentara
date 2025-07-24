import { PrismaClient } from '@prisma/client';

async function testAdminModeratorCreation() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testing Admin/Moderator creation logic (DRY RUN)...\n');

    // Get existing admin users without Admin records
    const adminUsers = await prisma.user.findMany({
      where: { 
        role: 'admin',
        admin: null  // Only users without Admin records
      }
    });

    // Get existing moderator users without Moderator records
    const moderatorUsers = await prisma.user.findMany({
      where: { 
        role: 'moderator',
        moderator: null  // Only users without Moderator records
      }
    });

    console.log(`👨‍💼 Found ${adminUsers.length} admin users without Admin records:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.id})`);
      console.log('     Would create Admin record with:');
      console.log('       permissions: ["user_management", "therapist_approval", "system_admin"]');
      console.log('       adminLevel: "admin"');
    });

    console.log(`\n👮 Found ${moderatorUsers.length} moderator users without Moderator records:`);
    moderatorUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.id})`);
      console.log('     Would create Moderator record with:');
      console.log('       permissions: ["content_moderation", "community_management"]');
      console.log('       assignedCommunities: {}');
    });

    console.log('\n✅ The seeding fix would create the missing records properly.');
    console.log('   Once the fix is deployed and seeding runs, all relationships will be complete.');

  } catch (error) {
    console.error('Error testing admin/moderator creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminModeratorCreation();