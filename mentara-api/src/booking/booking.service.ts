import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { MeetingStatus } from '@prisma/client';
import type {
  MeetingCreateDto,
  MeetingUpdateDto,
  TherapistAvailabilityCreateDto,
  TherapistAvailabilityUpdateDto,
} from './types';
import { EventBusService } from '../common/events/event-bus.service';
import { SlotGeneratorService } from './services/slot-generator.service';
import { ConflictDetectionService } from './services/conflict-detection.service';
import { AvailabilityValidatorService } from './services/availability-validator.service';
import { BillingService } from '../billing/billing.service';
import {
  AppointmentBookedEvent,
  AppointmentCancelledEvent,
  AppointmentCompletedEvent,
  AppointmentRescheduledEvent,
} from '../common/events/booking-events';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly slotGenerator: SlotGeneratorService,
    private readonly conflictDetection: ConflictDetectionService,
    private readonly availabilityValidator: AvailabilityValidatorService,
    private readonly billingService: BillingService,
  ) {}

  // Meeting Management
  async createMeeting(createMeetingDto: MeetingCreateDto, clientId: string) {
    const { startTime, therapistId, duration } = createMeetingDto;
    const startTimeDate = new Date(startTime || createMeetingDto.dateTime);
    const endTimeDate = new Date(startTimeDate.getTime() + duration * 60000);

    // Use database transaction to prevent race conditions
    return this.prisma.$transaction(async (tx) => {
      // First, acquire locks on both therapist and client schedules
      // This prevents concurrent bookings from interfering
      const [therapistLock, clientLock] = await Promise.all([
        tx.user.findUnique({
          where: { id: therapistId },
          select: { id: true }
        }),
        tx.user.findUnique({
          where: { id: clientId },
          select: { id: true }
        })
      ]);

      if (!therapistLock || !clientLock) {
        throw new BadRequestException('Therapist or client not found');
      }

      // Check for conflicts within transaction (atomic operation)
      const conflictingMeetings = await tx.meeting.findMany({
        where: {
          OR: [
            {
              therapistId,
              startTime: { lt: endTimeDate },
              endTime: { gt: startTimeDate },
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
            {
              clientId,
              startTime: { lt: endTimeDate },
              endTime: { gt: startTimeDate },
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
          ],
        },
      });

      if (conflictingMeetings.length > 0) {
        throw new BadRequestException(
          `Schedule conflict detected: ${conflictingMeetings.length} conflicting meetings found`
        );
      }

      // Validate therapist availability within transaction
      // Get therapist's timezone preference
      const therapist = await tx.therapist.findUnique({
        where: { userId: therapistId },
        select: { timezone: true },
      });
      
      const therapistTimezone = therapist?.timezone || 'UTC';
      
      // Convert to therapist's timezone for availability check
      const therapistLocalTime = new Date(startTimeDate.toLocaleString('en-US', { timeZone: therapistTimezone }));
      const therapistLocalEndTime = new Date(endTimeDate.toLocaleString('en-US', { timeZone: therapistTimezone }));
      
      const dayOfWeek = therapistLocalTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const timeOnly = therapistLocalTime.toTimeString().slice(0, 5); // HH:MM format
      const endTimeOnly = therapistLocalEndTime.toTimeString().slice(0, 5);

      const availability = await tx.therapistAvailability.findFirst({
        where: {
          therapistId,
          dayOfWeek,
          startTime: { lte: timeOnly },
          endTime: { gte: endTimeOnly },
          isAvailable: true,
        },
      });

      if (!availability) {
        throw new BadRequestException(
          `Therapist is not available at the requested time (${timeOnly}-${endTimeOnly} ${dayOfWeek} in ${therapistTimezone})`
        );
      }

      // Create the meeting within the transaction
      const meeting = await tx.meeting.create({
        data: {
          ...createMeetingDto,
          startTime: startTimeDate,
          endTime: endTimeDate,
          status: 'SCHEDULED',
          clientId,
        },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // NOTE: Payment processing now handled separately when client pays for session
      // The meeting is created first, then payment is processed via billing controller
      // This allows for better payment flow and error handling

      // Publish appointment booked event
      await this.eventBus.emit(
        new AppointmentBookedEvent({
          appointmentId: meeting.id,
          clientId: meeting.clientId,
          therapistId: meeting.therapistId,
          startTime: meeting.startTime,
          meetingType: meeting.meetingType as
            | 'video'
            | 'audio'
            | 'in_person'
            | 'chat',
          duration: meeting.duration,
          title: meeting.title || 'Therapy Session',
          description: meeting.description || undefined,
          isInitialConsultation: false,
        }),
      );

      // Transform the response to match frontend expectations
      return {
        ...meeting,
        dateTime: meeting.startTime, // Map startTime to dateTime for frontend compatibility
        therapistName: meeting.therapist?.user 
          ? `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`
          : 'Unknown Therapist',
      };
    }, {
      isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions
      timeout: 10000, // 10 second timeout
      maxWait: 5000, // Max wait time for transaction lock
    });
  }

  async getMeetings(userId: string, role: string) {
    try {
      const where =
        role === 'therapist' ? { therapistId: userId } : { clientId: userId };

      const meetings = await this.prisma.meeting.findMany({
        where,
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      // Transform the response to match frontend expectations
      return meetings.map(meeting => ({
        ...meeting,
        dateTime: meeting.startTime, // Map startTime to dateTime for frontend compatibility
        therapistName: meeting.therapist?.user 
          ? `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`
          : 'Unknown Therapist',
      }));
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getMeeting(id: string, userId: string, role: string) {
    try {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      // Verify user has access to this meeting
      if (role === 'therapist' && meeting.therapistId !== userId) {
        throw new ForbiddenException('Access denied');
      }
      if (role === 'client' && meeting.clientId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Transform the response to match frontend expectations
      return {
        ...meeting,
        dateTime: meeting.startTime, // Map startTime to dateTime for frontend compatibility
        therapistName: meeting.therapist?.user 
          ? `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`
          : 'Unknown Therapist',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async updateMeeting(
    id: string,
    updateMeetingDto: MeetingUpdateDto,
    userId: string,
    role: string,
  ) {
    try {
      const meeting = await this.getMeeting(id, userId, role);

      // Only allow updates if meeting is not completed or cancelled
      if (['COMPLETED', 'CANCELLED'].includes(meeting.status)) {
        throw new BadRequestException(
          'Cannot update completed or cancelled meetings',
        );
      }

      // If updating time, validate the new schedule
      if (updateMeetingDto.startTime || updateMeetingDto.duration) {
        const newStartTime = updateMeetingDto.startTime
          ? new Date(updateMeetingDto.startTime)
          : meeting.startTime;
        const newDuration = updateMeetingDto.duration || meeting.duration;

        // Check for conflicts with the update
        const conflicts = await this.conflictDetection.checkUpdateConflicts(
          id,
          meeting.therapistId,
          meeting.clientId,
          newStartTime,
          newDuration,
        );

        if (conflicts.hasConflict) {
          throw new BadRequestException(
            `Schedule update would cause conflicts: ${conflicts.conflictingMeetings.length} conflicting meetings found`,
          );
        }

        // Validate therapist availability for new time
        if (updateMeetingDto.startTime) {
          await this.availabilityValidator.validateTherapistAvailability(
            meeting.therapistId,
            newStartTime,
            newDuration,
          );
        }
      }

      const updatedMeeting = await this.prisma.meeting.update({
        where: { id },
        data: {
          title: updateMeetingDto.title,
          description: updateMeetingDto.description,
          startTime: updateMeetingDto.startTime,
          duration: updateMeetingDto.duration,
          meetingType: updateMeetingDto.meetingType,
          meetingUrl: updateMeetingDto.meetingUrl,
          ...(updateMeetingDto.status && {
            status: updateMeetingDto.status as MeetingStatus,
          }),
        },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Publish appropriate events
      if (updateMeetingDto.status === 'completed') {
        await this.eventBus.emit(
          new AppointmentCompletedEvent({
            appointmentId: updatedMeeting.id,
            clientId: updatedMeeting.clientId,
            therapistId: updatedMeeting.therapistId,
            completedAt: new Date(),
            duration: updatedMeeting.duration,
            sessionNotes: updateMeetingDto.description || '',
            attendanceStatus: 'ATTENDED',
          }),
        );
      } else if (
        updateMeetingDto.startTime &&
        new Date(updateMeetingDto.startTime).getTime() !==
          meeting.startTime.getTime()
      ) {
        await this.eventBus.emit(
          new AppointmentRescheduledEvent({
            appointmentId: updatedMeeting.id,
            clientId: updatedMeeting.clientId,
            therapistId: updatedMeeting.therapistId,
            rescheduledBy: userId,
            originalStartTime: meeting.startTime,
            newStartTime: new Date(updateMeetingDto.startTime),
            rescheduleReason: `Rescheduled by ${role}`,
          }),
        );
      }

      return updatedMeeting;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async cancelMeeting(id: string, userId: string, role: string) {
    try {
      const meeting = await this.getMeeting(id, userId, role);

      if (meeting.status === 'CANCELLED') {
        throw new BadRequestException('Meeting is already cancelled');
      }

      if (meeting.status === 'COMPLETED') {
        throw new BadRequestException('Cannot cancel completed meetings');
      }

      const cancelledMeeting = await this.prisma.meeting.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Calculate cancellation notice
      const cancellationNotice = Math.floor(
        (meeting.startTime.getTime() - Date.now()) / (1000 * 60 * 60),
      );

      // Handle payment refund for cancelled sessions
      try {
        // Find payment record associated with this meeting using the updated API
        const payments = await this.billingService.getUserPayments(userId, { 
          limit: 100 
        });
        const meetingPayment = payments.find(p => p.meetingId === meeting.id);
        
        if (meetingPayment && cancellationNotice >= 24) { // 24-hour cancellation policy
          // NOTE: Refund logic would need to be implemented in billing service
          // For now, we'll emit an event that a refund is needed
          this.logger.log(`Refund needed for cancelled session ${meeting.id} - ${cancellationNotice}h notice`);
          // TODO: Implement refund processing in billing service
        }
      } catch (refundError) {
        // Log refund error but don't fail the cancellation
        console.error('Failed to process refund for cancelled meeting:', refundError);
      }

      // Publish cancellation event
      await this.eventBus.emit(
        new AppointmentCancelledEvent({
          appointmentId: cancelledMeeting.id,
          clientId: cancelledMeeting.clientId,
          therapistId: cancelledMeeting.therapistId,
          cancelledBy: userId,
          cancellationReason:
            role === 'client'
              ? 'Cancelled by client'
              : 'Cancelled by therapist',
          originalStartTime: meeting.startTime,
          cancelledAt: new Date(),
          cancellationNotice: Math.max(0, cancellationNotice),
        }),
      );

      return cancelledMeeting;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Availability Management
  async createAvailability(
    createAvailabilityDto: TherapistAvailabilityCreateDto,
    therapistId: string,
  ) {
    try {
      const { dayOfWeek, startTime, endTime, notes } = createAvailabilityDto;

      // Validate using our new service
      await this.availabilityValidator.validateAvailabilityCreation({
        therapistId,
        dayOfWeek,
        startTime,
        endTime,
      });

      return this.prisma.therapistAvailability.create({
        data: {
          therapistId,
          dayOfWeek: dayOfWeek.toString(),
          startTime,
          endTime,
          notes,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getAvailability(therapistId: string) {
    try {
      return await this.prisma.therapistAvailability.findMany({
        where: { therapistId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async updateAvailability(
    id: string,
    updateAvailabilityDto: TherapistAvailabilityUpdateDto,
    therapistId: string,
  ) {
    try {
      const availability = await this.prisma.therapistAvailability.findFirst({
        where: { id, therapistId },
      });

      if (!availability) {
        throw new NotFoundException('Availability slot not found');
      }

      // Convert dayOfWeek to string if present
      const { dayOfWeek, ...rest } = updateAvailabilityDto;
      const updateData = {
        ...rest,
        ...(dayOfWeek !== undefined && {
          dayOfWeek: dayOfWeek.toString(),
        }),
      };

      return this.prisma.therapistAvailability.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async deleteAvailability(id: string, therapistId: string) {
    try {
      const availability = await this.prisma.therapistAvailability.findFirst({
        where: { id, therapistId },
      });

      if (!availability) {
        throw new NotFoundException('Availability slot not found');
      }

      return this.prisma.therapistAvailability.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Simplified slot generation using our new service
  async getAvailableSlots(therapistId: string, date: string) {
    try {
      return await this.slotGenerator.generateAvailableSlots(therapistId, date);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Duration management
  getDurations() {
    return [
      { id: '30', name: '30 minutes', duration: 30 },
      { id: '60', name: '60 minutes', duration: 60 },
      { id: '90', name: '90 minutes', duration: 90 },
      { id: '120', name: '120 minutes', duration: 120 },
    ];
  }

  // Enhanced validation method using our services
  async validateMeetingTime(
    therapistId: string,
    clientId: string,
    startTime: string | Date,
    duration: number,
  ) {
    const startTimeDate = new Date(startTime);

    await this.availabilityValidator.validateMeetingCreation({
      therapistId,
      clientId,
      startTime: startTimeDate,
      duration,
    });

    await this.conflictDetection.validateNoConflicts(
      therapistId,
      clientId,
      startTimeDate,
      duration,
    );

    return true;
  }
}
