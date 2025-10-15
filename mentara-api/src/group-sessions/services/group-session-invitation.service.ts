import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaClient, InvitationStatus } from '@prisma/client';
import { AvailabilityCheckService } from './availability-check.service';
import { GroupSessionService } from './group-session.service';

@Injectable()
export class GroupSessionInvitationService {
  private readonly logger = new Logger(GroupSessionInvitationService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly availabilityCheck: AvailabilityCheckService,
    private readonly groupSessionService: GroupSessionService,
  ) {}

  /**
   * Create invitations for therapists
   */
  async createInvitations(sessionId: string, therapistIds: string[]) {
    const invitations: any[] = [];

    for (const therapistId of therapistIds) {
      const invitation = await this.prisma.groupSessionTherapistInvitation.create({
        data: {
          sessionId,
          therapistId,
          status: InvitationStatus.PENDING,
        },
      });
      invitations.push(invitation);
    }

    this.logger.log(`Created ${invitations.length} invitations for session ${sessionId}`);

    return invitations;
  }

  /**
   * Get invitations for a therapist
   */
  async getInvitationsForTherapist(
    therapistId: string,
    status?: InvitationStatus,
  ) {
    const where: any = { therapistId };

    if (status) {
      where.status = status;
    }

    return this.prisma.groupSessionTherapistInvitation.findMany({
      where,
      include: {
        session: {
          include: {
            community: true,
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                participants: true,
                therapistInvitations: true,
              },
            },
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });
  }

  /**
   * Respond to an invitation (accept or decline)
   */
  async respondToInvitation(
    therapistId: string,
    invitationId: string,
    action: 'ACCEPTED' | 'DECLINED',
    message?: string,
  ) {
    // Get invitation
    const invitation = await this.prisma.groupSessionTherapistInvitation.findUnique({
      where: { id: invitationId },
      include: {
        session: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify therapist owns this invitation
    if (invitation.therapistId !== therapistId) {
      throw new UnauthorizedException('This invitation is not for you');
    }

    // Cannot respond to already responded invitation
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation already ${invitation.status.toLowerCase()}`);
    }

    if (action === 'ACCEPTED') {
      // Check therapist availability
      const hasConflict = await this.availabilityCheck.checkAvailability(
        therapistId,
        invitation.session.scheduledAt,
        invitation.session.duration,
      );

      if (hasConflict) {
        throw new ConflictException(
          'You have a scheduling conflict with this session',
        );
      }

      // Accept invitation
      const updated = await this.prisma.groupSessionTherapistInvitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          respondedAt: new Date(),
          message,
        },
      });

      this.logger.log(`Therapist ${therapistId} accepted invitation ${invitationId}`);

      // Check if all invitations are accepted
      const allAccepted = await this.checkAllInvitationsAccepted(invitation.sessionId);

      if (allAccepted) {
        // Update session to APPROVED
        await this.groupSessionService.approveSession(invitation.sessionId);
        this.logger.log(`Session ${invitation.sessionId} approved - all therapists accepted`);
      }

      return { invitation: updated, allAccepted };
    } else {
      // Decline invitation
      const updated = await this.prisma.groupSessionTherapistInvitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.DECLINED,
          respondedAt: new Date(),
          message,
        },
      });

      this.logger.log(`Therapist ${therapistId} declined invitation ${invitationId}`);

      return { invitation: updated, allAccepted: false };
    }
  }

  /**
   * Check if all invitations for a session are accepted
   */
  async checkAllInvitationsAccepted(sessionId: string): Promise<boolean> {
    const invitations = await this.prisma.groupSessionTherapistInvitation.findMany({
      where: { sessionId },
    });

    if (invitations.length === 0) {
      return false;
    }

    return invitations.every((inv) => inv.status === InvitationStatus.ACCEPTED);
  }

  /**
   * Get invitation by ID
   */
  async getInvitation(invitationId: string) {
    const invitation = await this.prisma.groupSessionTherapistInvitation.findUnique({
      where: { id: invitationId },
      include: {
        session: {
          include: {
            community: true,
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }
}

