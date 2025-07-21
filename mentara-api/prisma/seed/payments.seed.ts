// Payment System Seed Module
// Handles creation of payment transactions and payment methods

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

// Card brands for realistic payment methods
const CARD_BRANDS = [
  'Visa',
  'Mastercard', 
  'American Express',
  'Discover',
  'JCB',
];

// Digital wallet providers
const DIGITAL_WALLETS = [
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Samsung Pay',
  'Amazon Pay',
];

export async function seedPaymentMethods(
  prisma: PrismaClient,
  users: any[]
) {
  console.log('💳 Creating payment methods...');

  const paymentMethods: any[] = [];
  
  // Give most users 1-3 payment methods
  for (const user of users) {
    const methodCount = faker.number.int({ min: 1, max: 3 });
    let isFirstMethod = true;
    
    for (let i = 0; i < methodCount; i++) {
      const methodType = faker.helpers.arrayElement([
        'CARD',
        'CARD', 
        'CARD', // Weight towards cards
        'BANK_ACCOUNT',
        'DIGITAL_WALLET',
      ]);
      
      let cardLast4 = null;
      let cardBrand = null;
      
      if (methodType === 'CARD') {
        cardLast4 = faker.string.numeric(4);
        cardBrand = faker.helpers.arrayElement(CARD_BRANDS);
      } else if (methodType === 'DIGITAL_WALLET') {
        cardBrand = faker.helpers.arrayElement(DIGITAL_WALLETS);
      }
      
      const method = await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          type: methodType,
          cardLast4,
          cardBrand,
          isDefault: isFirstMethod, // First method is default
        },
      });
      
      paymentMethods.push(method);
      isFirstMethod = false;
    }
  }

  console.log(`✅ Created ${paymentMethods.length} payment methods`);
  return paymentMethods;
}

export async function seedPayments(
  prisma: PrismaClient,
  meetings: any[],
  paymentMethods: any[]
) {
  console.log('💰 Creating payment transactions...');

  const payments: any[] = [];
  
  // Create payments for completed/past meetings
  const meetingsWithPayments = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    const now = new Date();
    return meetingDate < now; // Only past meetings get payments
  });

  for (const meeting of meetingsWithPayments) {
    // Find client's payment methods
    const clientPaymentMethods = paymentMethods.filter(
      pm => pm.userId === meeting.clientId
    );
    
    if (clientPaymentMethods.length === 0) {
      console.log(`⚠️ No payment methods for client ${meeting.clientId}, skipping payment`);
      continue;
    }

    // Use default payment method or random one
    const defaultMethod = clientPaymentMethods.find(pm => pm.isDefault);
    const selectedMethod = defaultMethod || faker.helpers.arrayElement(clientPaymentMethods);
    
    // Generate realistic payment amounts (therapy session costs)
    const baseAmount = faker.number.float({ min: 80, max: 250, fractionDigits: 2 });
    const amount = Math.round(baseAmount * 100) / 100; // Ensure 2 decimal places
    
    // Determine payment status with realistic distribution
    const statusDistribution = [
      'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', // 80% completed
      'PENDING', // 10% pending  
      'FAILED', // 5% failed
      'REFUNDED', // 5% refunded
    ];
    const status = faker.helpers.arrayElement(statusDistribution);
    
    // Set timestamps based on status
    let processedAt = null;
    let failedAt = null;
    let failureReason = null;
    
    if (status === 'COMPLETED' || status === 'REFUNDED') {
      processedAt = faker.date.between({ 
        from: meeting.startTime, 
        to: new Date(meeting.startTime.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours
      });
    } else if (status === 'FAILED') {
      failedAt = faker.date.between({
        from: meeting.startTime,
        to: new Date(meeting.startTime.getTime() + 2 * 60 * 60 * 1000) // Within 2 hours
      });
      failureReason = faker.helpers.arrayElement([
        'Insufficient funds',
        'Card declined',
        'Payment method expired',
        'Bank authorization failed',
        'Processing timeout',
      ]);
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: 'USD',
        status,
        clientId: meeting.clientId,
        therapistId: meeting.therapistId,
        meetingId: meeting.id,
        paymentMethodId: selectedMethod.id,
        processedAt,
        failedAt,
        failureReason,
      },
    });

    payments.push(payment);
    
    const statusEmoji = {
      COMPLETED: '✅',
      PENDING: '⏳',
      FAILED: '❌',
      REFUNDED: '🔄'
    }[status];
    
    console.log(`${statusEmoji} Payment $${amount} (${status}) for meeting ${meeting.id.slice(0, 8)}`);
  }

  // Create some standalone payments (not linked to meetings - could be consultations, etc.)
  const standaloneCount = Math.floor(payments.length * 0.2); // 20% of meeting payments
  
  for (let i = 0; i < standaloneCount; i++) {
    const clientMethod = faker.helpers.arrayElement(paymentMethods);
    
    // Find a therapist (any therapist) for standalone payment
    const therapists = await prisma.therapist.findMany({
      take: 10, // Just get a few to choose from
    });
    
    if (therapists.length === 0) continue;
    
    const therapist = faker.helpers.arrayElement(therapists);
    const amount = faker.number.float({ min: 50, max: 150, fractionDigits: 2 }); // Consultation fees
    
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: 'USD',
        status: 'COMPLETED',
        clientId: clientMethod.userId,
        therapistId: therapist.userId,
        meetingId: null, // Standalone payment
        paymentMethodId: clientMethod.id,
        processedAt: faker.date.past({ days: 60 }),
      },
    });

    payments.push(payment);
  }

  console.log(`✅ Created ${payments.length} payment transactions`);
  console.log(`   💰 ${payments.filter(p => p.status === 'COMPLETED').length} completed`);
  console.log(`   ⏳ ${payments.filter(p => p.status === 'PENDING').length} pending`);
  console.log(`   ❌ ${payments.filter(p => p.status === 'FAILED').length} failed`);
  console.log(`   🔄 ${payments.filter(p => p.status === 'REFUNDED').length} refunded`);
  
  return payments;
}