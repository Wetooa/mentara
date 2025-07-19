import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
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
  CreateVideoRoomDto,
  CreateVideoRoomDtoSchema,
  JoinVideoRoomDto,
  JoinVideoRoomDtoSchema,
  EndVideoCallDto,
  EndVideoCallDtoSchema,
  VideoRoomResponse,
  VideoCallStatus,
  UpdateMeetingStatusDto,
  UpdateMeetingStatusDtoSchema,
  SaveMeetingSessionDto,
  SaveMeetingSessionDtoSchema,
} from 'mentara-commons';

@ApiTags('meetings')
@ApiBearerAuth('JWT-auth')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve get meeting',

    description: 'Retrieve get meeting',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMeeting(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.meetingsService.getMeetingById(meetingId, userId);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update update meeting status',

    description: 'Update update meeting status',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updateMeetingStatus(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(UpdateMeetingStatusDtoSchema))
    updateStatusDto: UpdateMeetingStatusDto,
  ) {
    return this.meetingsService.updateMeetingStatus(
      meetingId,
      userId,
      updateStatusDto,
    );
  }

  // ===== VIDEO CALL INTEGRATION ENDPOINTS =====

  @Post(':id/video-room')
  @ApiOperation({
    summary: 'Create create video room',

    description: 'Create create video room',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async createVideoRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(CreateVideoRoomDtoSchema))
    createRoomDto: CreateVideoRoomDto,
  ): Promise<VideoRoomResponse> {
    return this.meetingsService.createVideoRoom(
      meetingId,
      userId,
      createRoomDto,
    );
  }

  @Post(':id/join-video')
  @ApiOperation({
    summary: 'Create join video room',

    description: 'Create join video room',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async joinVideoRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(JoinVideoRoomDtoSchema))
    joinRoomDto: JoinVideoRoomDto,
  ): Promise<VideoRoomResponse> {
    return this.meetingsService.joinVideoRoom(meetingId, userId, joinRoomDto);
  }

  @Get(':id/video-status')
  @ApiOperation({
    summary: 'Retrieve get video call status',

    description: 'Retrieve get video call status',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getVideoCallStatus(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ): Promise<VideoCallStatus> {
    return this.meetingsService.getVideoCallStatus(meetingId, userId);
  }

  @Delete(':id/video-room')
  @ApiOperation({
    summary: 'Delete end video call',

    description: 'Delete end video call',
  })
  @ApiResponse({
    status: 200,

    description: 'Deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async endVideoCall(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(EndVideoCallDtoSchema))
    endCallDto: EndVideoCallDto,
  ): Promise<void> {
    return this.meetingsService.endVideoCall(meetingId, userId, endCallDto);
  }

  // Legacy endpoint for backward compatibility
  @Post(':id/room')
  @ApiOperation({
    summary: 'Create generate meeting room',

    description: 'Create generate meeting room',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateMeetingRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ) {
    // Redirect to new video room creation with default settings
    const defaultCreateDto: CreateVideoRoomDto = {
      meetingId,
      roomType: 'video',
      maxParticipants: 2,
      enableRecording: false,
      enableChat: true,
    };
    return this.meetingsService.createVideoRoom(
      meetingId,
      userId,
      defaultCreateDto,
    );
  }

  @Get('upcoming')
  @ApiOperation({
    summary: 'Retrieve get upcoming meetings',

    description: 'Retrieve get upcoming meetings',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUpcomingMeetings(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.meetingsService.getUpcomingMeetings(userId, limit);
  }

  @Post(':id/session')
  @ApiOperation({
    summary: 'Create save meeting session',

    description: 'Create save meeting session',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async saveMeetingSession(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(SaveMeetingSessionDtoSchema))
    sessionData: SaveMeetingSessionDto,
  ) {
    // Validate user has access to this meeting
    await this.meetingsService.getMeetingById(meetingId, userId);

    return this.meetingsService.saveMeetingSession(
      meetingId,
      userId,
      sessionData,
    );
  }

  @Get('analytics/therapist')
  @ApiOperation({
    summary: 'Retrieve get therapist meeting analytics',

    description: 'Retrieve get therapist meeting analytics',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTherapistMeetingAnalytics(
    @CurrentUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
          }
        : undefined;

    return this.meetingsService.getMeetingAnalytics(userId, dateRange);
  }

  @Post(':id/emergency-terminate')
  @ApiOperation({
    summary: 'Create emergency terminate',

    description: 'Create emergency terminate',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async emergencyTerminate(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body() body: { reason: string },
  ) {
    return this.meetingsService.emergencyTerminateMeeting(
      meetingId,
      body.reason,
      userId,
    );
  }
}
