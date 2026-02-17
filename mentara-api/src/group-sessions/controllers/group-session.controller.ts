import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { Roles } from '../../auth/core/decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { GroupSessionService } from '../services/group-session.service';
import { GroupSessionInvitationService } from '../services/group-session-invitation.service';
import { GroupSessionParticipantService } from '../services/group-session-participant.service';
import { GroupSessionNotificationService } from '../services/group-session-notification.service';
import {
  CreateGroupSessionDto,
  CreateGroupSessionDtoSchema,
} from '../dto/create-group-session.dto';

@Controller('group-sessions')
@UseGuards(JwtAuthGuard)
export class GroupSessionController {
  private readonly logger = new Logger(GroupSessionController.name);

  constructor(
    private readonly groupSessionService: GroupSessionService,
    private readonly invitationService: GroupSessionInvitationService,
    private readonly participantService: GroupSessionParticipantService,
    private readonly notificationService: GroupSessionNotificationService,
  ) {}

  /**
   * Create a new group session (Moderator only)
   */
  @Post()
  @Roles('moderator')
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @GetUser('id') moderatorId: string,
    @Body(new ZodValidationPipe(CreateGroupSessionDtoSchema))
    createDto: CreateGroupSessionDto,
  ) {
    // Create the session
    const session = await this.groupSessionService.createSession(
      moderatorId,
      createDto.communityId,
      createDto,
    );

    // Create invitations for therapists
    const invitations = await this.invitationService.createInvitations(
      session.id,
      createDto.therapistIds,
    );

    // Send notifications to invited therapists
    await this.notificationService.sendInvitationNotifications(
      session,
      createDto.therapistIds,
    );

    return {
      session,
      invitationsSent: invitations.length,
      message: 'Group session created successfully',
    };
  }

  /**
   * Get sessions for a community
   */
  @Get('community/:communityId')
  async getSessionsByCommunity(
    @GetUser('id') userId: string,
    @Param('communityId') communityId: string,
    @Query('status') status?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.groupSessionService.getSessionsByCommunity(communityId, {
      status: status as any,
      upcoming: upcoming === 'true',
    }, userId);
  }

  /**
   * Get session details
   */
  @Get(':sessionId')
  async getSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.groupSessionService.getSession(sessionId, userId);
  }

  /**
   * Cancel a session (Moderator only)
   */
  @Delete(':sessionId')
  @Roles('moderator')
  async cancelSession(
    @GetUser('id') moderatorId: string,
    @Param('sessionId') sessionId: string,
    @Body('reason') reason?: string,
  ) {
    const session = await this.groupSessionService.cancelSession(
      sessionId,
      moderatorId,
      reason,
    );

    // Notify all participants and therapists
    await this.notificationService.notifySessionCancelled(session);

    return {
      message: 'Session cancelled successfully',
      session,
    };
  }

  /**
   * Join a session (Community members)
   */
  @Post(':sessionId/join')
  @HttpCode(HttpStatus.OK)
  async joinSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    const participant = await this.participantService.joinSession(
      userId,
      sessionId,
    );

    // Send confirmation notification
    await this.notificationService.notifyUserJoinedSession(
      userId,
      participant.session,
    );

    return {
      participant,
      message: 'Successfully joined the session',
    };
  }

  /**
   * Leave a session
   */
  @Delete(':sessionId/leave')
  async leaveSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.participantService.leaveSession(userId, sessionId);
  }

  /**
   * Get participants for a session
   */
  @Get(':sessionId/participants')
  async getParticipants(@Param('sessionId') sessionId: string) {
    return this.participantService.getParticipants(sessionId);
  }

  /**
   * Get my joined sessions
   */
  @Get('my/sessions')
  async getMyJoinedSessions(
    @GetUser('id') userId: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.participantService.getSessionsForUser(
      userId,
      upcoming === 'true',
    );
  }
}
