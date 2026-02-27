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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/core/decorators/current-user-role.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BookingService } from './booking.service';
import {
  BookingMeetingParamsDtoSchema,
  AvailabilityParamsDtoSchema,
  GetAvailableSlotsQueryDtoSchema,
} from './validation/booking.schemas';
import type {
  TherapistAvailabilityCreateDto,
  TherapistAvailabilityUpdateDto,
  MeetingCreateDto,
  MeetingUpdateDto,
  BookingMeetingParamsDto,
  AvailabilityParamsDto,
  GetAvailableSlotsQueryDto,
} from './types';

@ApiTags('booking')
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
    @Query('status') status?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.bookingService.getMeetings(userId, role, {
      status,
      limit,
      offset,
    });
  }

  @Get('meetings/:id')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async getMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.getMeeting(params.id, userId, role);
  }

  @Put('meetings/:id')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
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
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async cancelMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.cancelMeeting(params.id, userId, role);
  }

  @Post('meetings/:id/accept')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async acceptMeetingRequest(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @Body() body: { meetingUrl: string },
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.acceptMeetingRequest(
      params.id,
      body.meetingUrl,
      userId,
      role,
    );
  }

  @Post('meetings/:id/start')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async startMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.startMeeting(params.id, userId, role);
  }

  @Post('meetings/:id/complete')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async completeMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @Body() body: { notes?: string },
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.completeMeeting(
      params.id,
      userId,
      role,
      body.notes,
    );
  }

  @Post('meetings/:id/no-show')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async markNoShow(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.markNoShow(params.id, userId, role);
  }

  @Put('meetings/:id/notes')
  @ApiParam({ name: 'id', description: 'The meeting ID' })
  async saveMeetingNotes(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @Body() body: { notes: string },
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.saveMeetingNotes(
      params.id,
      body.notes,
      userId,
      role,
    );
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
  @ApiParam({ name: 'id', description: 'The availability ID' })
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
  @ApiParam({ name: 'id', description: 'The availability ID' })
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

  // Cancellation policy endpoint (public)
  @Get('cancellation-policy')
  getCancellationPolicy() {
    return this.bookingService.getCancellationPolicy();
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
