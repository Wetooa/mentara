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
} from '../../schema/booking';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  // Meeting Management
  async createMeeting(createMeetingDto: MeetingCreateDto, clientId: string) {
    try {
      const { startTime, therapistId, duration } = createMeetingDto;

      // Verify therapist exists and is active
      const therapist = await this.prisma.therapist.findFirst({
        where: {
          userId: therapistId,
        },
      });

      if (!therapist) {
        throw new NotFoundException('Therapist not found or inactive');
      }

      // Verify client-therapist relationship exists
      const relationship = await this.prisma.clientTherapist.findFirst({
        where: {
          clientId,
          therapistId,
        },
      });

      if (!relationship) {
        throw new ForbiddenException(
          'You can only book meetings with your assigned therapists',
        );
      }

      // Check for scheduling conflicts
      const startTimeDate = new Date(startTime);
      const endTimeDate = new Date(
        startTimeDate.getTime() + duration * 60 * 1000,
      ); // Convert duration (minutes) to milliseconds

      const conflicts = await this.prisma.meeting.findMany({
        where: {
          OR: [
            {
              therapistId,
              AND: [
                {
                  startTime: {
                    lt: endTimeDate,
                  },
                },
                {
                  startTime: {
                    gte: startTimeDate,
                  },
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED'] },
            },
            {
              clientId,
              AND: [
                {
                  startTime: {
                    lt: endTimeDate,
                  },
                },
                {
                  startTime: {
                    gte: startTimeDate,
                  },
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED'] },
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        throw new BadRequestException(
          'Time slot conflicts with existing meetings',
        );
      }

      // Verify therapist availability for this time slot
      const dayOfWeek = new Date(startTime).getDay();
      const startTimeStr = new Date(startTime).toTimeString().slice(0, 5);
      const endTimeStr = new Date(
        new Date(startTime).getTime() + duration * 60 * 1000,
      )
        .toTimeString()
        .slice(0, 5);

      const availability = await this.prisma.therapistAvailability.findFirst({
        where: {
          therapistId,
          dayOfWeek,
          startTime: { lte: startTimeStr },
          endTime: { gte: endTimeStr },
          isAvailable: true,
        },
      });

      if (!availability) {
        throw new BadRequestException(
          'Therapist is not available at this time',
        );
      }

      // Validate time format
      const timeRegex = /^([0-1]?[\d]|2[0-3]):[0-5][\d]$/;
      if (!timeRegex.test(startTimeStr)) {
        throw new BadRequestException('Invalid time format. Use HH:MM format');
      }

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
      return this.prisma.meeting.update({
        where: { id },
        data: {
          title: updateMeetingDto.title,
          description: updateMeetingDto.description,
          startTime: updateMeetingDto.startTime,
          duration: updateMeetingDto.duration,
          meetingType: updateMeetingDto.meetingType,
          therapistId: updateMeetingDto.therapistId,
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

      return this.prisma.meeting.update({
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

      // Validate time format
      const timeRegex = /^([0-1]?[\d]|2[0-3]):[0-5][\d]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new BadRequestException('Invalid time format. Use HH:MM format');
      }

      // Validate time range
      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Check for overlapping availability
      const overlapping = await this.prisma.therapistAvailability.findFirst({
        where: {
          therapistId,
          dayOfWeek,
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          'Availability slot overlaps with existing slot',
        );
      }

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

  // Duration Management
  private getDurations() {
    return [
      { id: '30', name: '30 minutes', duration: 30 },
      { id: '60', name: '60 minutes', duration: 60 },
      { id: '90', name: '90 minutes', duration: 90 },
      { id: '120', name: '120 minutes', duration: 120 },
    ];
  }

  // Get available time slots for a therapist on a specific date
  async getAvailableSlots(therapistId: string, date: string) {
    try {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();

      // Get therapist's availability for this day
      const availability = await this.prisma.therapistAvailability.findMany({
        where: {
          therapistId,
          dayOfWeek,
          isAvailable: true,
        },
        orderBy: { startTime: 'asc' },
      });

      if (availability.length === 0) {
        return [];
      }

      // Get existing bookings for this date
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await this.prisma.meeting.findMany({
        where: {
          therapistId,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { startTime: 'asc' },
      });

      // Get available durations
      const durations = this.getDurations();

      // Generate available slots
      const availableSlots: {
        startTime: string;
        availableDurations: {
          id: string;
          name: string;
          duration: number;
        }[];
      }[] = [];

      const slotInterval = 30; // 30-minute intervals

      for (const avail of availability) {
        const startTime = new Date(targetDate);
        const [startHour, startMinute] = avail.startTime.split(':').map(Number);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(targetDate);
        const [endHour, endMinute] = avail.endTime.split(':').map(Number);
        endTime.setHours(endHour, endMinute, 0, 0);

        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
          const slotEnd = new Date(
            currentTime.getTime() + slotInterval * 60000,
          );

          if (slotEnd <= endTime) {
            // Check if this slot conflicts with existing bookings
            const conflicts = existingBookings.filter((booking) => {
              const bookingEnd = new Date(
                booking.startTime.getTime() + booking.duration * 60000,
              );
              return (
                (currentTime >= booking.startTime &&
                  currentTime < bookingEnd) ||
                (slotEnd > booking.startTime && slotEnd <= bookingEnd) ||
                (currentTime <= booking.startTime && slotEnd >= bookingEnd)
              );
            });

            if (conflicts.length === 0) {
              // Check which durations fit in this slot
              const availableDurations = durations.filter((duration) => {
                const durationEnd = new Date(
                  currentTime.getTime() + duration.duration * 60000,
                );
                return (
                  durationEnd <= endTime &&
                  !existingBookings.some((booking) => {
                    const bookingEnd = new Date(
                      booking.startTime.getTime() + booking.duration * 60000,
                    );
                    return (
                      (currentTime >= booking.startTime &&
                        currentTime < bookingEnd) ||
                      (durationEnd > booking.startTime &&
                        durationEnd <= bookingEnd) ||
                      (currentTime <= booking.startTime &&
                        durationEnd >= bookingEnd)
                    );
                  })
                );
              });

              if (availableDurations.length > 0) {
                availableSlots.push({
                  startTime: currentTime.toISOString(),
                  availableDurations,
                });
              }
            }
          }

          currentTime = new Date(currentTime.getTime() + slotInterval * 60000);
        }
      }

      return availableSlots;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private validateTimeFormat(timeStr: string) {
    const timeRegex = /^([0-1]?[\d]|2[0-3]):[0-5][\d]$/;
    if (!timeRegex.test(timeStr)) {
      throw new BadRequestException('Invalid time format. Use HH:MM format');
    }
  }

  private getTimeInfo(startTime: string | Date, duration: number) {
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    return {
      dayOfWeek: startDate.getDay(),
      startTimeStr: startDate.toTimeString().slice(0, 5),
      endTimeStr: endDate.toTimeString().slice(0, 5),
    };
  }

  private async checkTherapistAvailability(
    therapistId: string,
    timeInfo: { dayOfWeek: number; startTimeStr: string; endTimeStr: string },
  ) {
    const { dayOfWeek, startTimeStr, endTimeStr } = timeInfo;

    const availability = await this.prisma.therapistAvailability.findFirst({
      where: {
        therapistId,
        dayOfWeek,
        startTime: { lte: startTimeStr },
        endTime: { gte: endTimeStr },
        isAvailable: true,
      },
    });

    if (!availability) {
      throw new BadRequestException('Therapist is not available at this time');
    }
  }

  private validateDuration(duration: number) {
    const validDurations = this.getDurations().map((d) => d.duration);
    if (!validDurations.includes(duration)) {
      throw new BadRequestException('Invalid meeting duration');
    }
  }

  private async checkSchedulingConflicts(
    therapistId: string,
    clientId: string,
    startTime: Date,
    duration: number,
  ) {
    const endTimeDate = new Date(startTime.getTime() + duration * 60 * 1000);

    const conflicts = await this.prisma.meeting.findMany({
      where: {
        OR: [
          {
            therapistId,
            AND: [
              {
                startTime: {
                  lt: endTimeDate,
                },
              },
              {
                startTime: {
                  gte: startTime,
                },
              },
            ],
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          {
            clientId,
            AND: [
              {
                startTime: {
                  lt: endTimeDate,
                },
              },
              {
                startTime: {
                  gte: startTime,
                },
              },
            ],
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new BadRequestException(
        'Time slot conflicts with existing meetings',
      );
    }
  }

  async validateMeetingTime(
    therapistId: string,
    clientId: string,
    startTime: string | Date,
    duration: number,
  ) {
    // Validate duration
    this.validateDuration(duration);

    // Get time information
    const timeInfo = this.getTimeInfo(startTime, duration);
    this.validateTimeFormat(timeInfo.startTimeStr);

    // Check therapist availability
    await this.checkTherapistAvailability(therapistId, timeInfo);

    // Check for scheduling conflicts
    await this.checkSchedulingConflicts(
      therapistId,
      clientId,
      new Date(startTime),
      duration,
    );
  }
}
