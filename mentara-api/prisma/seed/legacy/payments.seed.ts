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

// Philippine mobile number prefixes for GCash and Maya
const PH_MOBILE_PREFIXES = [
  '0917', '0918', '0919', '0920', '0921', '0928', '0929',
  '0939', '0949', '0950', '0951', '0961', '0962', '0963',
  '0905', '0906', '0915', '0916', '0926', '0927', '0935',
  '0936', '0937', '0938', '0945', '0953', '0954', '0955',
  '0956', '0965', '0966', '0967', '0975', '0976', '0977',
  '0978', '0979', '0995', '0996', '0997', '0998', '0999'
];

// Generate Philippine mobile number
function generatePhilippineMobile(): string {
  const prefix = faker.helpers.arrayElement(PH_MOBILE_PREFIXES);
  const suffix = faker.string.numeric(7);
  return `${prefix}${suffix}`;
}

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
        'GCASH',
        'MAYA',
      ]);
      
      // Initialize all possible fields
      let methodData: any = {
        userId: user.id,
        type: methodType,
        isDefault: isFirstMethod,
        isActive: true,
        nickname: undefined,
        billingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: methodType === 'GCASH' || methodType === 'MAYA' ? 'Philippines' : 'United States'
        }
      };
      
      if (methodType === 'CARD') {
        const cardBrand = faker.helpers.arrayElement(CARD_BRANDS);
        methodData = {
          ...methodData,
          cardLast4: faker.string.numeric(4),
          cardBrand,
          cardholderName: faker.person.fullName(),
          cardNumber: `****-****-****-${faker.string.numeric(4)}`,
          expiryMonth: faker.number.int({ min: 1, max: 12 }),
          expiryYear: faker.number.int({ min: 2024, max: 2030 }),
          cardType: cardBrand,
          nickname: `My ${cardBrand} Card`
        };
      } else if (methodType === 'BANK_ACCOUNT') {
        const accountType = faker.helpers.arrayElement(['Checking', 'Savings']);
        methodData = {
          ...methodData,
          bankName: faker.helpers.arrayElement(['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank']),
          accountHolderName: faker.person.fullName(),
          accountType,
          routingNumber: `****${faker.string.numeric(5)}`,
          accountLast4: faker.string.numeric(4),
          nickname: `My ${accountType} Account`
        };
      } else if (methodType === 'DIGITAL_WALLET') {
        const walletProvider = faker.helpers.arrayElement(DIGITAL_WALLETS);
        methodData = {
          ...methodData,
          walletProvider,
          walletEmail: faker.internet.email(),
          walletAccountName: faker.person.fullName(),
          nickname: `My ${walletProvider}`
        };
      } else if (methodType === 'GCASH') {
        const gcashNumber = generatePhilippineMobile();
        methodData = {
          ...methodData,
          gcashNumber,
          gcashName: faker.person.fullName(),
          isVerified: faker.datatype.boolean(0.8), // 80% verified
          gcashEmail: faker.internet.email(),
          nickname: `GCash ${gcashNumber.slice(-4)}`
        };
      } else if (methodType === 'MAYA') {
        const mayaNumber = generatePhilippineMobile();
        methodData = {
          ...methodData,
          mayaNumber,
          mayaName: faker.person.fullName(),
          mayaVerified: faker.datatype.boolean(0.75), // 75% verified
          mayaEmail: faker.internet.email(),
          nickname: `Maya ${mayaNumber.slice(-4)}`
        };
      }
      
      const method = await prisma.paymentMethod.create({
        data: methodData,
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
    const statusDistribution: ('COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED')[] = [
      'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', // 80% completed
      'PENDING', // 10% pending  
      'FAILED', // 5% failed
      'REFUNDED', // 5% refunded
    ];
    const status = faker.helpers.arrayElement(statusDistribution);
    
    // Set timestamps based on status
    let processedAt: Date | undefined = undefined;
    let failedAt: Date | undefined = undefined;
    let failureReason: string | undefined = undefined;
    
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
  
  // Filter payment methods to only those belonging to actual clients
  const clientPaymentMethods: any[] = [];
  for (const method of paymentMethods) {
    const client = await prisma.client.findUnique({
      where: { userId: method.userId }
    });
    if (client) {
      clientPaymentMethods.push(method);
    }
  }
  
  if (clientPaymentMethods.length === 0) {
    console.log('⚠️ No payment methods from actual clients found, skipping standalone payments');
  } else {
    for (let i = 0; i < standaloneCount; i++) {
      const clientMethod = faker.helpers.arrayElement(clientPaymentMethods);
    
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
        clientId: clientMethod.userId, // This is now guaranteed to be a valid Client.userId
        therapistId: therapist.userId,
        meetingId: null, // Standalone payment
        paymentMethodId: clientMethod.id,
        processedAt: faker.date.past({ years: 0.2 }), // Within ~2 months
      },
    });

    payments.push(payment);
    }
  }

  console.log(`✅ Created ${payments.length} payment transactions`);
  console.log(`   💰 ${payments.filter(p => p.status === 'COMPLETED').length} completed`);
  console.log(`   ⏳ ${payments.filter(p => p.status === 'PENDING').length} pending`);
  console.log(`   ❌ ${payments.filter(p => p.status === 'FAILED').length} failed`);
  console.log(`   🔄 ${payments.filter(p => p.status === 'REFUNDED').length} refunded`);
  
  return payments;
}