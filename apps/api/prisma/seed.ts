import { PrismaClient, QuestionnaireType, TherapistApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const domains = Object.values(QuestionnaireType);

function updateProgress(current: number, total: number, label: string) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * percentage) / 100);
  const bar = '█'.repeat(filledLength) + '-'.repeat(barLength - filledLength);
  process.stdout.write(`\r[${bar}] ${percentage}% | ${current}/${total} ${label}`);
  if (current === total) {
    process.stdout.write('\n');
  }
}

async function main() {
  console.log('Starting seed process...');
  const password = await bcrypt.hash('Password123', 12);
  
  // Create 1 Admin
  const adminEmail = 'admin@mentara.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'System',
        lastName: 'Admin',
        password: password,
        role: 'admin',
        emailVerified: true,
        isActive: true,
        admin: {
          create: {
            permissions: ['ALL'],
            adminLevel: 'super_admin'
          }
        }
      }
    });
    console.log('✅ Created Admin account');
  } else {
    console.log('ℹ️ Admin account already exists');
  }

  // Create Communities (1 per domain)
  console.log('Seeding communities...');
  const totalCommunities = domains.length;
  let currentCommunity = 0;
  for (const domain of domains) {
    const formattedDomain = domain.charAt(0) + domain.slice(1).toLowerCase().replace(/_/g, ' ');
    const commName = `${formattedDomain} Community`;
    const slug = domain.toLowerCase().replace(/_/g, '-');
    
    // Check if community exists
    let community = await prisma.community.findUnique({ where: { slug: slug } });
    if (!community) {
      community = await prisma.community.create({
        data: {
          name: commName,
          slug: slug,
          description: `A safe space for discussing and managing ${formattedDomain}.`,
          imageUrl: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=600&auto=format&fit=crop', // generic mental health image
          category: 'mental-health',
          illnesses: [domain],
          roomGroups: {
            create: {
              name: 'General',
              order: 1,
              rooms: {
                create: [
                  { name: 'General Chat', order: 1, postingRole: 'member' },
                  { name: 'Resources', order: 2, postingRole: 'member' },
                  { name: 'Support', order: 3, postingRole: 'member' }
                ]
              }
            }
          }
        }
      });
    }
    currentCommunity++;
    updateProgress(currentCommunity, totalCommunities, 'Communities');
  }

  // Create Therapists
  // Configurable amount of therapists per domain. E.g if SEED_THERAPISTS_PER_DOMAIN=2, it will be 2 * 15 = 30 therapists
  const therapistsPerDomain = parseInt(process.env.SEED_THERAPISTS_PER_DOMAIN || '2', 10);
  const totalTherapists = therapistsPerDomain * domains.length;
  console.log(`Seeding ${therapistsPerDomain} therapists per domain (${totalTherapists} total)...`);

  let newTherapistsCount = 0;
  let currentTherapist = 0;
  for (const domain of domains) {
    for (let i = 1; i <= therapistsPerDomain; i++) {
      const therapistEmail = `therapist.${domain.toLowerCase()}.${i}@mentara.com`;
      const existingUser = await prisma.user.findUnique({ where: { email: therapistEmail } });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: therapistEmail,
            firstName: `Therapist${i}`,
            lastName: domain.charAt(0) + domain.slice(1).toLowerCase().replace(/_/g, ' '),
            password: password,
            role: 'therapist',
            emailVerified: true,
            isActive: true,
            therapist: {
              create: {
                mobile: '+639123456789',
                province: 'Metro Manila',
                status: TherapistApplicationStatus.APPROVED,
                providerType: 'Psychologist',
                professionalLicenseType: 'Psychologist',
                isPRCLicensed: 'Yes',
                prcLicenseNumber: `PRC-${domain}-${i}`,
                expirationDateOfLicense: new Date('2030-01-01'),
                practiceStartDate: new Date('2020-01-01'),
                licenseVerified: true,
                licenseVerifiedAt: new Date(),
                providedOnlineTherapyBefore: true,
                comfortableUsingVideoConferencing: true,
                compliesWithDataPrivacyAct: true,
                willingToAbideByPlatformGuidelines: true,
                illnessSpecializations: [domain],
                areasOfExpertise: [domain.toLowerCase()],
                expertise: [domain.toLowerCase()],
                approaches: ['CBT'],
                languages: ['English', 'Tagalog'],
                acceptTypes: ['Individual'],
                treatmentSuccessRates: { general: 90 },
                sessionLength: '60',
                hourlyRate: 1500.00,
                yearsOfExperience: 5 + (i % 5),
              }
            }
          }
        });
        newTherapistsCount++;
      }
      currentTherapist++;
      updateProgress(currentTherapist, totalTherapists, 'Therapists');
    }
  }
  
  if (newTherapistsCount > 0) {
     console.log(`✅ Created ${newTherapistsCount} new therapist accounts.`);
  } else {
     console.log(`ℹ️ All therapist accounts already exist.`);
  }

  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
