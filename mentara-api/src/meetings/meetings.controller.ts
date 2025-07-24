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
  ParseIntPipe,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
// TODO: Add validation schemas when needed
import type {
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto,
  VideoRoomResponse,
  VideoCallStatus,
  UpdateMeetingStatusDto,
  SaveMeetingSessionDto,
} from './types';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  // Specific routes must come before parameterized routes
  @Get('upcoming')
  async getUpcomingMeetings(
    @CurrentUserId() userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.meetingsService.getUpcomingMeetings(userId, limit);
  }

  @Get('completed')
  async getCompletedMeetings(
    @CurrentUserId() userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.meetingsService.getCompletedMeetings(userId, limit);
  }

  @Get('cancelled')
  async getCancelledMeetings(
    @CurrentUserId() userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.meetingsService.getCancelledMeetings(userId, limit);
  }

  @Get('in-progress')
  async getInProgressMeetings(
    @CurrentUserId() userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.meetingsService.getInProgressMeetings(userId, limit);
  }

  @Get(':id')
  async getMeeting(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.meetingsService.getMeetingById(meetingId, userId);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateMeetingStatus(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(/* validation disabled */)
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
  @HttpCode(HttpStatus.CREATED)
  async createVideoRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(/* validation disabled */)
    createRoomDto: CreateVideoRoomDto,
  ): Promise<VideoRoomResponse> {
    return this.meetingsService.createVideoRoom(
      meetingId,
      userId,
      createRoomDto,
    );
  }

  @Post(':id/join-video')
  @HttpCode(HttpStatus.OK)
  async joinVideoRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(/* validation disabled */)
    joinRoomDto: JoinVideoRoomDto,
  ): Promise<VideoRoomResponse> {
    return this.meetingsService.joinVideoRoom(meetingId, userId, joinRoomDto);
  }

  @Get(':id/video-status')
  @HttpCode(HttpStatus.OK)
  async getVideoCallStatus(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ): Promise<VideoCallStatus> {
    return this.meetingsService.getVideoCallStatus(meetingId, userId);
  }

  @Delete(':id/video-room')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endVideoCall(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(/* validation disabled */)
    endCallDto: EndVideoCallDto,
  ): Promise<void> {
    return this.meetingsService.endVideoCall(meetingId, userId, endCallDto);
  }

  // Legacy endpoint for backward compatibility
  @Post(':id/room')
  async generateMeetingRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ) {
    // Redirect to new video room creation with default settings
    const defaultCreateDto: CreateVideoRoomDto = {
      meetingId,
      roomType: 'consultation',
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

  @Get()
  async getAllMeetings(
    @CurrentUserId() userId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const queryOptions = {
      status,
      type,
      limit,
      offset,
      dateFrom,
      dateTo,
    };
    return this.meetingsService.getAllMeetings(userId, queryOptions);
  }

  @Post(':id/session')
  @HttpCode(HttpStatus.CREATED)
  async saveMeetingSession(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body(/* validation disabled */)
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
