import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';

@Controller('meetings')
@UseGuards(ClerkAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get(':id')
  async getMeeting(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.meetingsService.getMeetingById(meetingId, userId);
  }

  @Put(':id/status')
  async updateMeetingStatus(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body()
    body: {
      status:
        | 'SCHEDULED'
        | 'CONFIRMED'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'CANCELLED';
    },
  ) {
    return this.meetingsService.updateMeetingStatus(
      meetingId,
      userId,
      body.status,
    );
  }

  @Post(':id/room')
  async generateMeetingRoom(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.meetingsService.generateMeetingRoom(meetingId, userId);
  }

  @Get('upcoming')
  async getUpcomingMeetings(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.meetingsService.getUpcomingMeetings(userId, limit);
  }

  @Post(':id/session')
  async saveMeetingSession(
    @Param('id') meetingId: string,
    @CurrentUserId() userId: string,
    @Body() sessionData: any,
  ) {
    // Validate user has access to this meeting
    await this.meetingsService.getMeetingById(meetingId, userId);

    return this.meetingsService.saveMeetingSession({
      meetingId,
      ...sessionData,
    });
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
