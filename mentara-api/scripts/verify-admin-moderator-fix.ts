import { PrismaClient } from '@prisma/client';

async function verifyAdminModeratorFix() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Verifying Admin and Moderator table relationships...\n');

    // Check existing admin users and their Admin table entries
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      include: { admin: true }
    });

    console.log('👨‍💼 Admin Users:');
    if (adminUsers.length === 0) {
      console.log('   No admin users found');
    } else {
      adminUsers.forEach(user => {
        const hasAdminRecord = user.admin !== null;
        const status = hasAdminRecord ? '✅' : '❌';
        console.log(`   ${status} ${user.email} (${user.id})`);
        if (hasAdminRecord) {
          console.log(`      - Admin Level: ${user.admin?.adminLevel}`);
          console.log(`      - Permissions: [${user.admin?.permissions.join(', ')}]`);
        } else {
          console.log('      - Missing Admin table entry!');
        }
      });
    }

    // Check existing moderator users and their Moderator table entries
    const moderatorUsers = await prisma.user.findMany({
      where: { role: 'moderator' },
      include: { moderator: true }
    });

    console.log('\n👮 Moderator Users:');
    if (moderatorUsers.length === 0) {
      console.log('   No moderator users found');
    } else {
      moderatorUsers.forEach(user => {
        const hasModeratorRecord = user.moderator !== null;
        const status = hasModeratorRecord ? '✅' : '❌';
        console.log(`   ${status} ${user.email} (${user.id})`);
        if (hasModeratorRecord) {
          console.log(`      - Permissions: [${user.moderator?.permissions.join(', ')}]`);
        } else {
          console.log('      - Missing Moderator table entry!');
        }
      });
    }

    // Summary
    const adminsMissingRecords = adminUsers.filter(u => !u.admin).length;
    const moderatorsMissingRecords = moderatorUsers.filter(u => !u.moderator).length;

    console.log('\n📊 Summary:');
    console.log(`   Total admin users: ${adminUsers.length}`);
    console.log(`   Admins with Admin records: ${adminUsers.length - adminsMissingRecords}`);
    console.log(`   Admins missing Admin records: ${adminsMissingRecords}`);
    console.log(`   Total moderator users: ${moderatorUsers.length}`);
    console.log(`   Moderators with Moderator records: ${moderatorUsers.length - moderatorsMissingRecords}`);
    console.log(`   Moderators missing Moderator records: ${moderatorsMissingRecords}`);

    if (adminsMissingRecords === 0 && moderatorsMissingRecords === 0) {
      console.log('\n🎉 All admin and moderator users have proper table relationships!');
    } else {
      console.log('\n⚠️  Some users are missing their corresponding Admin/Moderator records.');
      console.log('    This indicates the seeding issue has not been resolved yet.');
    }

  } catch (error) {
    console.error('Error verifying admin/moderator fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminModeratorFix();