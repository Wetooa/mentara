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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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

@ApiTags('booking')
@ApiBearerAuth('JWT-auth')
@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Meeting endpoints
  @Post('meetings')

  @ApiOperation({ 

    summary: 'Create create meeting',

    description: 'Create create meeting' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Retrieve get meetings',


    description: 'Retrieve get meetings' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getMeetings(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.getMeetings(userId, role);
  }

  @Get('meetings/:id')


  @ApiOperation({ 


    summary: 'Retrieve get meeting',


    description: 'Retrieve get meeting' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  async getMeeting(
    @Param(new ZodValidationPipe(BookingMeetingParamsDtoSchema))
    params: BookingMeetingParamsDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    return this.bookingService.getMeeting(params.id, userId, role);
  }

  @Put('meetings/:id')


  @ApiOperation({ 


    summary: 'Update update meeting',


    description: 'Update update meeting' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Delete cancel meeting',


    description: 'Delete cancel meeting' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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

  @ApiOperation({ 

    summary: 'Create create availability',

    description: 'Create create availability' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Retrieve get availability',


    description: 'Retrieve get availability' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Update update availability',


    description: 'Update update availability' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Delete delete availability',


    description: 'Delete delete availability' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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

  @ApiOperation({ 

    summary: 'Retrieve get available slots',

    description: 'Retrieve get available slots' 

  })

  @ApiResponse({ 

    status: 200, 

    description: 'Retrieved successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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
