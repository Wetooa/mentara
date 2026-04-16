import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';

/**
 * Specialized guard for therapist dashboard access that validates:
 * 1. User is authenticated
 * 2. User has role 'therapist'
 * 3. User has corresponding Therapist record in database
 * 4. User account is active
 * 5. Therapist status is appropriate for dashboard access
 */
@Injectable()
export class TherapistDashboardAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userRole = request.userRole || user?.role;
    const userId = request.userId || user?.userId || user?.id;

    console.log(`🔐 [TherapistDashboardGuard] Validating access for userId: ${userId}, role: ${userRole}`);

    // 1. Check if user is authenticated
    if (!userId) {
      console.error(`❌ [TherapistDashboardGuard] No userId found in request`);
      throw new UnauthorizedException('Authentication required');
    }

    // 2. Verify user exists and get fresh data
    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!userRecord) {
      console.error(`❌ [TherapistDashboardGuard] User not found: ${userId}`);
      throw new NotFoundException(`User not found: ${userId}`);
    }

    console.log(`👤 [TherapistDashboardGuard] User found: ${userRecord.email}, role: ${userRecord.role}, active: ${userRecord.isActive}`);

    // 3. Check if user has therapist role
    if (userRecord.role !== 'therapist') {
      console.error(`❌ [TherapistDashboardGuard] User ${userRecord.email} has role '${userRecord.role}', expected 'therapist'`);
      throw new ForbiddenException(
        `Access denied. User role '${userRecord.role}' is not authorized for therapist dashboard. Required role: 'therapist'`
      );
    }

    // 4. Check if user account is active
    if (!userRecord.isActive) {
      console.error(`❌ [TherapistDashboardGuard] User ${userRecord.email} account is not active`);
      throw new ForbiddenException('Access denied. Account is not active.');
    }

    // 5. Verify Therapist record exists
    const therapistRecord = await this.prisma.therapist.findUnique({
      where: { userId: userRecord.id },
      select: {
        userId: true,
        status: true,
        createdAt: true,
        providerType: true,
        yearsOfExperience: true,
      },
    });

    if (!therapistRecord) {
      console.error(`❌ [TherapistDashboardGuard] Therapist record not found for user: ${userRecord.email} (${userId})`);
      console.error(`❌ [TherapistDashboardGuard] User has role 'therapist' but missing Therapist table record - data inconsistency!`);
      
      // This is a critical data consistency issue that should be escalated
      throw new ForbiddenException(
        `Access denied. Therapist profile not found for user ${userRecord.email}. ` +
        `This indicates a data consistency issue. Please contact support.`
      );
    }

    console.log(`👩‍⚕️ [TherapistDashboardGuard] Therapist record found: status=${therapistRecord.status}, provider=${therapistRecord.providerType}`);

    // 6. Check therapist status (warn but don't block for non-APPROVED status)
    if (therapistRecord.status !== 'APPROVED') {
      console.warn(`⚠️ [TherapistDashboardGuard] Therapist ${userRecord.email} has status: ${therapistRecord.status} (not APPROVED)`);
      
      // For PENDING/REJECTED status, we might want to show a different dashboard or message
      // but we'll allow access and let the dashboard service handle the specific display logic
      if (therapistRecord.status === 'REJECTED') {
        console.warn(`⚠️ [TherapistDashboardGuard] Allowing access but therapist application was rejected`);
      }
    }

    // 7. All validations passed
    console.log(`✅ [TherapistDashboardGuard] Access granted for therapist: ${userRecord.email}`);
    
    // Store validated therapist info in request for downstream use
    request.validatedTherapist = {
      userId: userRecord.id,
      email: userRecord.email,
      name: `${userRecord.firstName} ${userRecord.lastName}`,
      status: therapistRecord.status,
      providerType: therapistRecord.providerType,
    };

    return true;
  }
}