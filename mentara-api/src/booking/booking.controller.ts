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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BookingService } from './booking.service';
import {
  TherapistAvailabilityCreateDto,
  TherapistAvailabilityUpdateDto,
  MeetingCreateDto,
  MeetingUpdateDto,
  BookingMeetingParamsDtoSchema,
  AvailabilityParamsDtoSchema,
  GetAvailableSlotsQueryDtoSchema,
  type BookingMeetingParamsDto,
  type AvailabilityParamsDto,
  type GetAvailableSlotsQueryDto,
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
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.getMeeting(params.id, userId, role);
  }

  @Put('meetings/:id')
  async updateMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @Body() updateMeetingDto: MeetingUpdateDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.updateMeeting(
      params.id,
      updateMeetingDto,
      userId,
      role,
    );
  }

  @Delete('meetings/:id/cancel')
  async cancelMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.cancelMeeting(params.id, userId, role);
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
    @Param(new ZodValidationPipe(AvailabilityParamsDtoSchema))
    params: AvailabilityParamsDto,
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
      params.id,
      updateAvailabilityDto,
      therapistId,
    );
  }

  @Delete('availability/:id')
  async deleteAvailability(
    @Param(new ZodValidationPipe(AvailabilityParamsDtoSchema))
    params: AvailabilityParamsDto,
    @CurrentUserId() therapistId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'therapist') {
      throw new UnauthorizedException(
        'Only therapists can delete availability',
      );
    }
    return this.bookingService.deleteAvailability(params.id, therapistId);
  }

  // Duration endpoints (public)
  @Get('durations')
  getDurations() {
    return this.bookingService.getDurations();
  }

  // Available slots endpoint
  @Get('slots')
  async getAvailableSlots(
    @Query(new ZodValidationPipe(GetAvailableSlotsQueryDtoSchema))
    query: GetAvailableSlotsQueryDto,
  ) {
    return this.bookingService.getAvailableSlots(query.therapistId, query.date);
  }
}
