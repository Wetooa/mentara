import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/decorators/current-user-role.decorator';
import { BookingService } from './booking.service';
import {
  TherapistAvailabilityCreateDto,
  TherapistAvailabilityUpdateDto,
  MeetingCreateDto,
  MeetingUpdateDto,
} from 'mentara-commons';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Meeting endpoints
  @Post('meetings')
  async createMeeting(
    @Body() createMeetingDto: MeetingCreateDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    // Only clients can book meetings, but we'll validate the relationship in the service
    if (role !== 'client') {
      throw new ForbiddenException('Only clients can book meetings');
    }
    return this.bookingService.createMeeting(createMeetingDto, userId);
  }

  @Get('meetings')
  async getMeetings(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.getMeetings(userId, role);
  }

  @Get('meetings/:id')
  async getMeeting(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.getMeeting(id, userId, role);
  }

  @Put('meetings/:id')
  async updateMeeting(
    @Param('id') id: string,
    @Body() updateMeetingDto: MeetingUpdateDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.updateMeeting(
      id,
      updateMeetingDto,
      userId,
      role,
    );
  }

  @Delete('meetings/:id/cancel')
  async cancelMeeting(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.cancelMeeting(id, userId, role);
  }

  // Availability endpoints (therapist only)
  @Post('availability')
  async createAvailability(
    @Body() createAvailabilityDto: TherapistAvailabilityCreateDto,
    @CurrentUserId() therapistId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'therapist') {
      throw new UnauthorizedException(
        'Only therapists can manage availability',
      );
    }
    return this.bookingService.createAvailability(
      createAvailabilityDto,
      therapistId,
    );
  }

  @Get('availability')
  async getAvailability(
    @CurrentUserId() therapistId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'therapist') {
      throw new UnauthorizedException(
        'Only therapists can view their availability',
      );
    }
    return this.bookingService.getAvailability(therapistId);
  }

  @Put('availability/:id')
  async updateAvailability(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: TherapistAvailabilityUpdateDto,
    @CurrentUserId() therapistId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'therapist') {
      throw new UnauthorizedException(
        'Only therapists can update availability',
      );
    }
    return this.bookingService.updateAvailability(
      id,
      updateAvailabilityDto,
      therapistId,
    );
  }

  @Delete('availability/:id')
  async deleteAvailability(
    @Param('id') id: string,
    @CurrentUserId() therapistId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'therapist') {
      throw new UnauthorizedException(
        'Only therapists can delete availability',
      );
    }
    return this.bookingService.deleteAvailability(id, therapistId);
  }

  // Duration endpoints (public)
  @Get('durations')
  getDurations() {
    return this.bookingService.getDurations();
  }

  // Available slots endpoint
  @Get('slots')
  async getAvailableSlots(
    @Query('therapistId') therapistId: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getAvailableSlots(therapistId, date);
  }
}
