import {
  Controller,
  Get,
  Post,
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
import { GroupSessionInvitationService } from '../services/group-session-invitation.service';
import { GroupSessionNotificationService } from '../services/group-session-notification.service';
import {
  RespondToInvitationDto,
  RespondToInvitationDtoSchema,
} from '../dto/respond-to-invitation.dto';

@Controller('group-sessions/therapist')
@UseGuards(JwtAuthGuard)
@Roles('therapist')
export class GroupSessionTherapistController {
  private readonly logger = new Logger(GroupSessionTherapistController.name);

  constructor(
    private readonly invitationService: GroupSessionInvitationService,
    private readonly notificationService: GroupSessionNotificationService,
  ) {}

  /**
   * Get my invitations
   */
  @Get('invitations')
  async getInvitations(
    @GetUser('id') therapistId: string,
    @Query('status') status?: string,
  ) {
    return this.invitationService.getInvitationsForTherapist(
      therapistId,
      status as any,
    );
  }

  /**
   * Respond to an invitation
   */
  @Post('invitations/:invitationId/respond')
  @HttpCode(HttpStatus.OK)
  async respondToInvitation(
    @GetUser('id') therapistId: string,
    @GetUser('firstName') firstName: string,
    @GetUser('lastName') lastName: string,
    @Param('invitationId') invitationId: string,
    @Body(new ZodValidationPipe(RespondToInvitationDtoSchema))
    responseDto: RespondToInvitationDto,
  ) {
    const result = await this.invitationService.respondToInvitation(
      therapistId,
      invitationId,
      responseDto.action,
      responseDto.message,
    );

    // Get the invitation to access session details
    const invitation = await this.invitationService.getInvitation(invitationId);

    // Notify moderator of response
    const therapistName = `${firstName} ${lastName}`;
    await this.notificationService.notifyModeratorOfResponse(
      invitation.session,
      therapistName,
      responseDto.action,
      responseDto.message,
    );

    // If all accepted, notify community members
    if (result.allAccepted) {
      await this.notificationService.notifyCommunityMembersSessionApproved(
        invitation.session,
      );
    }

    return {
      ...result,
      message:
        responseDto.action === 'ACCEPTED'
          ? 'Invitation accepted successfully'
          : 'Invitation declined',
    };
  }
}

