const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestTherapistApplication() {
  try {
    console.log('Creating test therapist application...');

    // Create a test user first
    const testUserId = `temp_${Date.now()}_test@example.com`;
    
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test-therapist@example.com',
        firstName: 'Dr. Test',
        lastName: 'Therapist',
        role: 'client', // Will be changed to therapist on approval
        isActive: false,
      },
    });

    console.log('Created test user:', user.id);

    // Create a pending therapist application
    const application = await prisma.therapist.create({
      data: {
        userId: testUserId,
        status: 'pending',
        mobile: '+1234567890',
        province: 'Metro Manila',
        providerType: 'Licensed Clinical Psychologist',
        professionalLicenseType: 'PRC License',
        isPRCLicensed: 'Yes',
        prcLicenseNumber: 'TEST123456',
        expirationDateOfLicense: new Date('2025-12-31'),
        practiceStartDate: new Date('2020-01-01'),
        areasOfExpertise: ['Anxiety Disorders', 'Depression'],
        assessmentTools: ['PHQ-9', 'GAD-7'],
        therapeuticApproachesUsedList: ['Cognitive Behavioral Therapy'],
        languagesOffered: ['English'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        privateConfidentialSpace: 'Yes',
        compliesWithDataPrivacyAct: true,
        professionalLiabilityInsurance: 'Yes',
        complaintsOrDisciplinaryActions: 'No',
        willingToAbideByPlatformGuidelines: true,
        expertise: ['anxiety-disorders', 'depression'],
        approaches: ['cognitive-behavioral-therapy'],
        languages: ['english'],
        illnessSpecializations: ['anxiety-disorders'],
        acceptTypes: ['self-pay'],
        treatmentSuccessRates: { anxiety: 85, depression: 80 },
        sessionLength: '60 minutes',
        hourlyRate: 100.00,
        submissionDate: new Date(),
      },
    });

    console.log('Created test therapist application:', application.userId);
    console.log('Application status:', application.status);
    console.log('You can now test the approval workflow in the admin interface!');

  } catch (error) {
    console.error('Error creating test application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTherapistApplication();