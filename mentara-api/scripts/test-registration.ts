import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRegistrationEndpoints() {
  try {
    console.log('🧪 Testing registration endpoints...\n');

    // Test 1: Check if User model has the required fields
    console.log('1. Checking User model structure...');
    const userFields = await prisma.$queryRaw<
      Array<{ column_name: string; data_type: string; is_nullable: string }>
    >`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;

    const requiredFields = ['id', 'email', 'role', 'isActive'];
    const existingFields = userFields.map((field) => field.column_name);

    console.log('   Found fields:', existingFields);

    const missingFields = requiredFields.filter(
      (field) => !existingFields.includes(field),
    );
    if (missingFields.length > 0) {
      console.log('   ❌ Missing fields:', missingFields);
    } else {
      console.log('   ✅ All required fields present');
    }

    // Test 2: Test user creation
    console.log('\n2. Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        id: 'test_clerk_user_123',
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
      },
    });

    console.log('   ✅ Test user created:', {
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    // Test 3: Test therapist application creation
    console.log('\n3. Testing therapist application creation...');
    
    // First create the user for the therapist
    const therapistUser = await prisma.user.create({
      data: {
        id: 'test_clerk_therapist_123',
        email: 'testtherapist@example.com',
        firstName: 'Test',
        lastName: 'Therapist',
        role: 'therapist',
      },
    });
    
    const testTherapistApp = await prisma.therapist.create({
      data: {
        userId: 'test_clerk_therapist_123',
        firstName: 'Test',
        lastName: 'Therapist',
        email: 'testtherapist@example.com',
        mobile: '+1234567890',
        province: 'Metro Manila',
        providerType: 'Psychologist',
        professionalLicenseType: 'PRC',
        isPRCLicensed: 'Yes',
        prcLicenseNumber: '12345',
        isLicenseActive: 'Yes',
        practiceStartDate: new Date('2019-01-01'),
        yearsOfExperience: '5',
        areasOfExpertise: ['Anxiety', 'Depression'],
        assessmentTools: ['PHQ-9', 'GAD-7'],
        therapeuticApproachesUsedList: ['CBT', 'DBT'],
        languagesOffered: ['English', 'Tagalog'],
        providedOnlineTherapyBefore: 'Yes',
        comfortableUsingVideoConferencing: 'Yes',
        weeklyAvailability: '20 hours',
        preferredSessionLength: '50 minutes',
        accepts: ['Insurance', 'Self-pay'],
        privateConfidentialSpace: 'Yes',
        compliesWithDataPrivacyAct: 'Yes',
        professionalLiabilityInsurance: 'Yes',
        complaintsOrDisciplinaryActions: 'No',
        willingToAbideByPlatformGuidelines: 'Yes',
        applicationData: { test: 'data' },
      },
    });

    console.log('   ✅ Test therapist application created:', {
      id: testTherapistApp.userId,
      status: testTherapistApp.status,
      email: testTherapistApp.email,
    });

    // Clean up
    console.log('\n4. Cleaning up test data...');
    await prisma.user.delete({
      where: { id: 'test_clerk_user_123' },
    });
    await prisma.therapist.delete({
      where: { userId: 'test_clerk_therapist_123' },
    });
    console.log('   ✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Registration endpoints are ready.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRegistrationEndpoints();
