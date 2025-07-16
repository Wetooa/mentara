import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { MeetingStatus } from '@prisma/client';
import {
  MeetingCreateDto,
  MeetingUpdateDto,
  TherapistAvailabilityCreateDto,
  TherapistAvailabilityUpdateDto,
} from 'mentara-commons';
import { EventBusService } from '../common/events/event-bus.service';
import { SlotGeneratorService } from './services/slot-generator.service';
import { ConflictDetectionService } from './services/conflict-detection.service';
import { AvailabilityValidatorService } from './services/availability-validator.service';
import {
  AppointmentBookedEvent,
  AppointmentCancelledEvent,
  AppointmentCompletedEvent,
  AppointmentRescheduledEvent,
} from '../common/events/booking-events';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly slotGenerator: SlotGeneratorService,
    private readonly conflictDetection: ConflictDetectionService,
    private readonly availabilityValidator: AvailabilityValidatorService,
  ) {}

  // Meeting Management
  async createMeeting(createMeetingDto: MeetingCreateDto, clientId: string) {
    try {
      const { startTime, therapistId, duration } = createMeetingDto;
      const startTimeDate = new Date(startTime);

      // Comprehensive validation using our new services
      await this.availabilityValidator.validateMeetingCreation({
        therapistId,
        clientId,
        startTime: startTimeDate,
        duration,
      });

      // Check for conflicts using our dedicated service
      await this.conflictDetection.validateNoConflicts(
        therapistId,
        clientId,
        startTimeDate,
        duration,
      );

      // Create the meeting
      const meeting = await this.prisma.meeting.create({
        data: {
          ...createMeetingDto,
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

      return meeting;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getMeetings(userId: string, role: string) {
    try {
      const where =
        role === 'therapist' ? { therapistId: userId } : { clientId: userId };

      return await this.prisma.meeting.findMany({
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

      return meeting;
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
          notes: updateMeetingDto.notes,
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
          dayOfWeek,
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

      return this.prisma.therapistAvailability.update({
        where: { id },
        data: updateAvailabilityDto,
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
