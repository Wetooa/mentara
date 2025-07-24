#!/usr/bin/env node

/**
 * Test script to verify booking fixes
 * This script tests the availability validation logic directly
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingFixes() {
  console.log('🚀 Testing booking system fixes...\n');

  try {
    // 1. Check if we have therapist availability data
    console.log('1. Checking therapist availability data...');
    const availabilities = await prisma.therapistAvailability.findMany({
      take: 5,
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

    if (availabilities.length === 0) {
      console.log('❌ No therapist availability data found');
      return;
    }

    console.log(`✅ Found ${availabilities.length} availability slots:`);
    availabilities.forEach(avail => {
      const therapistName = avail.therapist?.user ? 
        `${avail.therapist.user.firstName} ${avail.therapist.user.lastName}` : 
        'Unknown';
      console.log(`   - ${therapistName}: ${avail.dayOfWeek} ${avail.startTime}-${avail.endTime} (${avail.timezone})`);
    });

    // 2. Test dayOfWeek format consistency
    console.log('\n2. Checking dayOfWeek format consistency...');
    const dayFormats = [...new Set(availabilities.map(a => a.dayOfWeek))];
    console.log(`✅ Day formats in database: ${dayFormats.join(', ')}`);

    // 3. Test timezone conversion logic with a sample availability
    console.log('\n3. Testing timezone conversion logic...');
    const sampleAvail = availabilities[0];
    const therapistId = sampleAvail.therapistId;
    
    // Create a test date for the same day of week as the availability
    // Database stores dayOfWeek as numeric strings: "0"=Sunday, "1"=Monday, etc.
    const targetDayNum = parseInt(sampleAvail.dayOfWeek);
    if (isNaN(targetDayNum) || targetDayNum < 0 || targetDayNum > 6) {
      console.log(`❌ Invalid day format: ${sampleAvail.dayOfWeek}`);
      return;
    }

    // Create a test datetime for next week on the target day
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days
    
    // Find the next occurrence of the target day
    const currentDay = nextWeek.getDay();
    const daysToAdd = (targetDayNum - currentDay + 7) % 7;
    const testDate = new Date(nextWeek.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    
    // Set time to within therapist's availability window (using the therapist's timezone)
    const [startHours, startMinutes] = sampleAvail.startTime.split(':').map(Number);
    
    // Create the test time in the therapist's timezone
    const testDateTime = new Date();
    testDateTime.setFullYear(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
    testDateTime.setHours(startHours + 1, startMinutes, 0, 0);
    
    // If therapist is in UTC, we can use the time directly
    if (therapistTimezone === 'UTC') {
      testDateTime.setUTCHours(startHours + 1, startMinutes, 0, 0);
    }

    console.log(`Test date: ${testDateTime.toISOString()}`);
    console.log(`Expected day: ${sampleAvail.dayOfWeek}`);
    
    // Test our new timezone conversion logic
    const therapist = await prisma.therapist.findUnique({
      where: { userId: therapistId },
      select: { timezone: true }
    });
    
    const therapistTimezone = therapist?.timezone || 'UTC';
    console.log(`Therapist timezone: ${therapistTimezone}`);

    // Use the same logic as our fixed code
    const therapistFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: therapistTimezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = therapistFormatter.formatToParts(testDateTime);
    
    // Convert day name to numeric string to match database format
    const dayName = parts.find(part => part.type === 'weekday')?.value || 'unknown';
    const dayMap = {
      'Sunday': '0', 'Monday': '1', 'Tuesday': '2', 'Wednesday': '3',
      'Thursday': '4', 'Friday': '5', 'Saturday': '6'
    };
    const extractedDay = dayMap[dayName] || '0';
    
    const extractedHour = parts.find(part => part.type === 'hour')?.value || '00';
    const extractedMinute = parts.find(part => part.type === 'minute')?.value || '00';
    const extractedTime = `${extractedHour}:${extractedMinute}`;
    
    console.log(`Extracted day: ${extractedDay}`);
    console.log(`Extracted time: ${extractedTime}`);
    console.log(`Expected time range: ${sampleAvail.startTime}-${sampleAvail.endTime}`);

    // Check if our logic would find this availability
    const foundAvailability = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId,
        dayOfWeek: extractedDay,
        startTime: { lte: extractedTime },
        endTime: { gte: extractedTime },
        isAvailable: true,
      },
    });

    if (foundAvailability) {
      console.log('✅ Availability validation logic works correctly!');
      console.log('✅ The dayOfWeek bug has been fixed!');
    } else {
      console.log('❌ Availability validation logic still has issues');
      console.log('Debug info:');
      console.log(`  - Looking for therapistId: ${therapistId}`);
      console.log(`  - Looking for dayOfWeek: ${extractedDay}`);
      console.log(`  - Looking for time range covering: ${extractedTime}`);
    }

    console.log('\n🎉 Booking fix verification completed!');

  } catch (error) {
    console.error('❌ Error testing booking fixes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingFixes();