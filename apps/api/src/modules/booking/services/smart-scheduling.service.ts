import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
export interface SchedulingSuggestion {
  therapistId: string;
  suggestedTimes: Array<{
    startTime: Date;
    endTime: Date;
    confidence: number; // 0-1
    reason: string;
  }>;
}

export interface RecurringScheduleConfig {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  startDate: Date;
  endDate?: Date;
  duration: number; // minutes
  timeOfDay: string; // HH:mm format
  timezone: string;
  occurrences?: number; // Total number of occurrences
}

@Injectable()
export class SmartSchedulingService {
  private readonly logger = new Logger(SmartSchedulingService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get smart scheduling suggestions based on therapist availability and client preferences
   */
  async getSchedulingSuggestions(
    therapistId: string,
    clientId: string,
    preferredTimes?: Array<{ start: Date; end: Date }>,
    duration: number = 60,
  ): Promise<SchedulingSuggestion> {

    // Get therapist availability
    const availabilities = await this.prisma.therapistAvailability.findMany({
      where: { therapistId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Get existing meetings to avoid conflicts
    const existingMeetings = await this.prisma.meeting.findMany({
      where: {
        therapistId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        startTime: { gte: new Date() },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Get client's previous meeting times (preference learning)
    const clientMeetings = await this.prisma.meeting.findMany({
      where: {
        clientId,
        status: 'COMPLETED',
      },
      select: {
        startTime: true,
      },
      orderBy: { startTime: 'desc' },
      take: 10,
    });

    // Analyze preferred times from history
    const preferredHours = new Map<number, number>(); // hour -> count
    clientMeetings.forEach((meeting) => {
      const hour = meeting.startTime.getHours();
      preferredHours.set(hour, (preferredHours.get(hour) || 0) + 1);
    });

    const suggestions: SchedulingSuggestion['suggestedTimes'] = [];
    const now = new Date();
    const lookAheadDays = 14; // Suggest times for next 2 weeks

    for (let dayOffset = 1; dayOffset <= lookAheadDays; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + dayOffset);
      const dayOfWeek = checkDate.getDay().toString();

      // Find matching availability
      const dayAvailability = availabilities.filter(
        (avail) => avail.dayOfWeek === dayOfWeek,
      );

      for (const avail of dayAvailability) {
        const [startHour, startMin] = avail.startTime.split(':').map(Number);
        const [endHour, endMin] = avail.endTime.split(':').map(Number);

        const slotStart = new Date(checkDate);
        slotStart.setHours(startHour, startMin, 0, 0);
        const slotEnd = new Date(checkDate);
        slotEnd.setHours(endHour, endMin, 0, 0);

        // Check if slot fits duration
        const slotDuration = (slotEnd.getTime() - slotStart.getTime()) / 60000;
        if (slotDuration < duration) continue;

        // Check for conflicts
        const hasConflict = existingMeetings.some((meeting) => {
          const meetingStart = new Date(meeting.startTime);
          const meetingEnd = meeting.endTime
            ? new Date(meeting.endTime)
            : new Date(meetingStart.getTime() + 60 * 60 * 1000);

          return (
            (slotStart >= meetingStart && slotStart < meetingEnd) ||
            (slotEnd > meetingStart && slotEnd <= meetingEnd) ||
            (slotStart <= meetingStart && slotEnd >= meetingEnd)
          );
        });

        if (hasConflict) continue;

        // Calculate confidence based on preferences
        let confidence = 0.5; // Base confidence
        const slotHour = slotStart.getHours();
        const preferenceCount = preferredHours.get(slotHour) || 0;
        if (preferenceCount > 0) {
          confidence += Math.min(preferenceCount * 0.1, 0.3); // Up to +0.3
        }

        // Prefer morning/afternoon slots
        if (slotHour >= 9 && slotHour <= 17) {
          confidence += 0.1;
        }

        // Prefer weekdays
        const dayOfWeekNum = parseInt(dayOfWeek, 10);
        if (dayOfWeekNum >= 1 && dayOfWeekNum <= 5) {
          confidence += 0.1;
        }

        confidence = Math.min(confidence, 1.0);

        const suggestedEnd = new Date(slotStart);
        suggestedEnd.setMinutes(suggestedEnd.getMinutes() + duration);

        suggestions.push({
          startTime: slotStart,
          endTime: suggestedEnd,
          confidence,
          reason: this.generateReason(slotStart, preferenceCount, dayOfWeekNum),
        });
      }
    }

    // Sort by confidence and limit to top 10
    suggestions.sort((a, b) => b.confidence - a.confidence);
    const topSuggestions = suggestions.slice(0, 10);

    const result: SchedulingSuggestion = {
      therapistId,
      suggestedTimes: topSuggestions,
    };

    return result;
  }

  /**
   * Generate recurring schedule
   */
  async createRecurringSchedule(
    therapistId: string,
    clientId: string,
    config: RecurringScheduleConfig,
  ): Promise<Array<{ startTime: Date; endTime: Date }>> {
    const meetings: Array<{ startTime: Date; endTime: Date }> = [];
    const startDate = new Date(config.startDate);
    const endDate = config.endDate || new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Default to 1 year ahead

    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (
      currentDate <= endDate &&
      (!config.occurrences || occurrenceCount < config.occurrences)
    ) {
      // Check if current date matches frequency and day requirements
      if (this.shouldScheduleOnDate(currentDate, config)) {
        const [hour, minute] = config.timeOfDay.split(':').map(Number);
        const meetingStart = new Date(currentDate);
        meetingStart.setHours(hour, minute, 0, 0);
        const meetingEnd = new Date(meetingStart);
        meetingEnd.setMinutes(meetingEnd.getMinutes() + config.duration);

        meetings.push({
          startTime: meetingStart,
          endTime: meetingEnd,
        });

        occurrenceCount++;
      }

      // Move to next potential date based on frequency
      currentDate = this.getNextDate(currentDate, config.frequency);
    }

    return meetings;
  }

  /**
   * Check if date should be scheduled based on config
   */
  private shouldScheduleOnDate(
    date: Date,
    config: RecurringScheduleConfig,
  ): boolean {
    if (config.daysOfWeek && config.daysOfWeek.length > 0) {
      return config.daysOfWeek.includes(date.getDay());
    }
    return true;
  }

  /**
   * Get next date based on frequency
   */
  private getNextDate(date: Date, frequency: string): Date {
    const next = new Date(date);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }

  /**
   * Generate reason for suggestion
   */
  private generateReason(
    startTime: Date,
    preferenceCount: number,
    dayOfWeek: number,
  ): string {
    const reasons: string[] = [];

    if (preferenceCount > 0) {
      reasons.push('Matches your preferred time');
    }

    const hour = startTime.getHours();
    if (hour >= 9 && hour <= 12) {
      reasons.push('Morning slot available');
    } else if (hour >= 13 && hour <= 17) {
      reasons.push('Afternoon slot available');
    }

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      reasons.push('Weekday availability');
    }

    return reasons.join(', ') || 'Available time slot';
  }

  /**
   * Get waitlist management suggestions
   */
  async getWaitlistSuggestions(
    therapistId: string,
    requestedTime: Date,
    duration: number,
  ): Promise<Array<{ date: Date; reason: string }>> {
    // Find alternative times near requested time
    const suggestions = await this.getSchedulingSuggestions(
      therapistId,
      '', // No specific client
      [{ start: requestedTime, end: new Date(requestedTime.getTime() + duration * 60000) }],
      duration,
    );

    return suggestions.suggestedTimes.map((suggestion) => ({
      date: suggestion.startTime,
      reason: suggestion.reason,
    }));
  }
}

