// Phase 7: Payment Transactions
// Creates payment transactions for meetings

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { seedPayments } from '../payments.seed';

export async function runPhase07Payments(
  prisma: PrismaClient,
  meetingsData: any,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`💰 PHASE 7: Creating payment transactions (${config} mode)...`);

  try {
    // Check if payments already exist (idempotent check)
    const existingCount = await prisma.payment.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing payments, skipping phase`);
      
      // Return existing data for next phases
      const existingPayments = await prisma.payment.findMany();
      
      return {
        success: true,
        message: `Found ${existingCount} existing payments`,
        skipped: true,
        data: { payments: existingPayments },
      };
    }

    // Get meetings and users from previous phases
    const meetings = meetingsData?.meetings || [];
    const users = usersData?.users || [];
    const paymentMethods = meetingsData?.paymentMethods || [];

    if (meetings.length === 0) {
      return {
        success: false,
        message: 'No meetings found for payment creation',
      };
    }

    if (paymentMethods.length === 0) {
      console.log('⚠️ No payment methods found, payments will be created without specific payment methods');
    }

    // Create payment transactions for meetings
    const payments = await seedPayments(prisma, meetings, users, paymentMethods, config);

    console.log(`✅ Phase 7 completed: Created ${payments.length} payment transactions`);

    return {
      success: true,
      message: `Payment transactions phase completed - ${payments.length} payments created`,
      data: { payments },
    };

  } catch (error) {
    console.error('❌ Phase 7 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}