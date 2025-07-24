import { PrismaClient } from '@prisma/client';

async function investigateTherapistDataConsistency() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Investigating Therapist data consistency issues...\n');

    // Check users with role='therapist' and their Therapist table entries
    const therapistUsers = await prisma.user.findMany({
      where: { role: 'therapist' },
      include: { 
        therapist: true,
        client: true // Also check if they accidentally have client records
      }
    });

    console.log('👩‍⚕️ Users with role="therapist":');
    if (therapistUsers.length === 0) {
      console.log('   No users with therapist role found');
    } else {
      let missingTherapistRecords = 0;
      let duplicateRecords = 0;

      therapistUsers.forEach(user => {
        const hasTherapistRecord = user.therapist !== null;
        const hasClientRecord = user.client !== null;
        const status = hasTherapistRecord ? '✅' : '❌';
        
        console.log(`   ${status} ${user.email} (${user.id}) - ${user.firstName} ${user.lastName}`);
        
        if (hasTherapistRecord) {
          console.log(`      - Therapist Status: ${user.therapist?.status}`);
          console.log(`      - Created: ${user.therapist?.createdAt.toISOString()}`);
          console.log(`      - Provider Type: ${user.therapist?.providerType || 'N/A'}`);
        } else {
          console.log('      - ❌ Missing Therapist table entry!');
          missingTherapistRecords++;
        }

        if (hasClientRecord) {
          console.log('      - ⚠️  Also has Client record (potential issue)');
          duplicateRecords++;
        }
      });

      console.log(`\n📊 Therapist Role Summary:`);
      console.log(`   Total users with therapist role: ${therapistUsers.length}`);
      console.log(`   Users with Therapist records: ${therapistUsers.length - missingTherapistRecords}`);
      console.log(`   Users missing Therapist records: ${missingTherapistRecords}`);
      console.log(`   Users with both roles: ${duplicateRecords}`);
    }

    // Check orphaned Therapist records (Therapist records without therapist role)
    const orphanedTherapists = await prisma.therapist.findMany({
      include: {
        user: true
      },
      where: {
        user: {
          role: { not: 'therapist' }
        }
      }
    });

    console.log('\n🔍 Orphaned Therapist records (Therapist table entries for non-therapist users):');
    if (orphanedTherapists.length === 0) {
      console.log('   No orphaned Therapist records found ✅');
    } else {
      orphanedTherapists.forEach(therapist => {
        console.log(`   ⚠️  ${therapist.user.email} (${therapist.userId})`);
        console.log(`      - Current role: ${therapist.user.role}`);
        console.log(`      - Therapist status: ${therapist.status}`);
      });
    }

    // Check current user attempting to access dashboard (if we can identify them)
    console.log('\n🔍 Recent therapist dashboard access attempts...');
    // Note: This would require session/log data, but we can check recently created therapist users
    const recentTherapistUsers = await prisma.user.findMany({
      where: { 
        role: 'therapist',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: { 
        therapist: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('   Recent therapist users (last 30 days):');
    if (recentTherapistUsers.length === 0) {
      console.log('   No recent therapist users found');
    } else {
      recentTherapistUsers.forEach(user => {
        const hasTherapistRecord = user.therapist !== null;
        const status = hasTherapistRecord ? '✅' : '❌';
        console.log(`   ${status} ${user.email} - Created: ${user.createdAt.toISOString()}`);
        if (!hasTherapistRecord) {
          console.log('      - 🚨 THIS USER WOULD EXPERIENCE THE DASHBOARD ERROR!');
        }
      });
    }

    // Generate recommendations
    console.log('\n💡 Recommendations:');
    const totalMissingRecords = therapistUsers.filter(u => !u.therapist).length;
    const totalOrphanedRecords = orphanedTherapists.length;

    if (totalMissingRecords > 0) {
      console.log(`   1. Create ${totalMissingRecords} missing Therapist records`);
      console.log(`   2. Consider if these users should actually have 'client' role instead`);
    }

    if (totalOrphanedRecords > 0) {
      console.log(`   3. Review ${totalOrphanedRecords} orphaned Therapist records`);
      console.log(`   4. Either update user roles to 'therapist' or remove Therapist records`);
    }

    if (totalMissingRecords === 0 && totalOrphanedRecords === 0) {
      console.log('   ✅ Data consistency looks good!');
      console.log('   ✅ The dashboard error might be caused by a different issue');
    } else {
      console.log('   🔧 Run the fix script after reviewing the above data');
    }

  } catch (error) {
    console.error('❌ Error investigating therapist data consistency:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the investigation
console.log('🚀 Starting Therapist Data Consistency Investigation...\n');
investigateTherapistDataConsistency()
  .then(() => {
    console.log('\n✅ Investigation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Investigation failed:', error);
    process.exit(1);
  });