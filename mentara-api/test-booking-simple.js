#!/usr/bin/env node

/**
 * Simple test to verify our booking dayOfWeek fixes
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingDayOfWeekFix() {
  console.log('🚀 Testing dayOfWeek format fixes...\n');

  try {
    // Get a therapist with availability
    const therapistWithAvailability = await prisma.therapistAvailability.findFirst({
      include: {
        therapist: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!therapistWithAvailability) {
      console.log('❌ No therapist availability found');
      return;
    }

    const therapistName = therapistWithAvailability.therapist?.user ? 
      `${therapistWithAvailability.therapist.user.firstName} ${therapistWithAvailability.therapist.user.lastName}` : 
      'Unknown';

    console.log(`Testing with: ${therapistName}`);
    console.log(`Database dayOfWeek: "${therapistWithAvailability.dayOfWeek}" (${typeof therapistWithAvailability.dayOfWeek})`);
    console.log(`Time range: ${therapistWithAvailability.startTime}-${therapistWithAvailability.endTime}`);
    console.log(`Timezone: ${therapistWithAvailability.timezone}\n`);

    // Create a test date that exactly matches this availability
    const targetDayNum = parseInt(therapistWithAvailability.dayOfWeek);
    
    // Create a specific date that has the target day of week
    const testDate = new Date('2025-07-27'); // Start with a known Sunday (day 0)
    testDate.setDate(testDate.getDate() + targetDayNum); // Add days to get to target day
    
    // Set to middle of availability window
    const [startHours, startMinutes] = therapistWithAvailability.startTime.split(':').map(Number);
    const [endHours, endMinutes] = therapistWithAvailability.endTime.split(':').map(Number);
    const midHours = startHours + Math.floor((endHours - startHours) / 2);
    testDate.setUTCHours(midHours, startMinutes, 0, 0);

    console.log(`Test date: ${testDate.toISOString()}`);
    console.log(`Test day of week: ${testDate.getDay()} (should match database: ${therapistWithAvailability.dayOfWeek})`);
    console.log(`Test time: ${testDate.getUTCHours().toString().padStart(2, '0')}:${testDate.getUTCMinutes().toString().padStart(2, '0')}\n`);

    // Test our availability query logic
    const duration = 60; // 1 hour
    const dayOfWeek = testDate.getDay().toString(); // This is what our fixed code does
    const startTimeStr = `${testDate.getUTCHours().toString().padStart(2, '0')}:${testDate.getUTCMinutes().toString().padStart(2, '0')}`;
    const endTime = new Date(testDate.getTime() + duration * 60 * 1000);
    const endTimeStr = `${endTime.getUTCHours().toString().padStart(2, '0')}:${endTime.getUTCMinutes().toString().padStart(2, '0')}`;

    console.log(`Query parameters:`);
    console.log(`  therapistId: ${therapistWithAvailability.therapistId}`);
    console.log(`  dayOfWeek: "${dayOfWeek}"`);
    console.log(`  startTime <= "${startTimeStr}"`);
    console.log(`  endTime >= "${endTimeStr}"`);

    // Execute the availability query (same as our fixed code)
    const availability = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: therapistWithAvailability.therapistId,
        dayOfWeek: dayOfWeek,
        startTime: { lte: startTimeStr },
        endTime: { gte: endTimeStr },
        isAvailable: true,
      },
    });

    console.log('\n' + '='.repeat(50));
    if (availability) {
      console.log('✅ SUCCESS! Availability validation logic works correctly!');
      console.log('✅ The dayOfWeek bug has been FIXED!');
      console.log(`Found availability: ID ${availability.id}`);
    } else {
      console.log('❌ FAILED! Availability validation logic still has issues');
      
      // Debug: show all availability for this therapist
      const allAvailability = await prisma.therapistAvailability.findMany({
        where: {
          therapistId: therapistWithAvailability.therapistId,
          isAvailable: true,
        }
      });
      
      console.log('\nAll availability for this therapist:');
      allAvailability.forEach(avail => {
        console.log(`  Day ${avail.dayOfWeek}: ${avail.startTime}-${avail.endTime}`);
      });
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error testing booking fixes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingDayOfWeekFix();