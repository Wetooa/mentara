# 🎯 BACKEND AGENT - MODULE 2 THERAPIST MATCHING DIRECTIVE

**From**: Project Manager  
**To**: Backend Agent  
**Priority**: HIGH  
**Module**: 2 - Therapist Matching System  
**Estimated Time**: 8-10 hours  
**Date**: 2025-01-15  

## 🎯 **MISSION OBJECTIVE**

**PRIMARY GOAL**: Implement complete backend infrastructure for end-to-end therapist matching system, including admin approval workflow, client-therapist request system, and enhanced recommendation algorithms.

**MODULE SCOPE**: This is Module 2 of the mental health platform - the core therapist matching functionality that connects clients with appropriate therapists through intelligent recommendations and approval workflows.

**SUCCESS DEFINITION**: Complete API infrastructure supporting admin therapist approval, client welcome flow with recommendations, therapist-client request system, and real-time matching analytics.

---

## 📊 **CURRENT STATE ANALYSIS**

### **✅ Existing Foundation (DO NOT MODIFY):**
- **Sophisticated Database Schema**: MatchHistory, ClientCompatibility, RecommendationFeedback models exist
- **Advanced Recommendation Algorithm**: TherapistRecommendationService with AI integration
- **Assessment Integration**: PreAssessment and Assessment models with severity scoring
- **Review System**: Complete review and rating infrastructure
- **First-time Tracking**: `hasSeenTherapistRecommendations` field implemented

### **❌ Critical Missing Components (IMPLEMENT THESE):**
1. **Admin Approval System**: No routes for therapist application management
2. **Client-Therapist Request Flow**: Missing invitation/request system between clients and therapists
3. **Therapist Response System**: No routes for therapists to accept/decline client requests
4. **Enhanced First-time Flow**: Missing welcome page specific endpoints
5. **Real-time Matching Notifications**: No notification integration for matching events

---

## 🚀 **3-PHASE IMPLEMENTATION STRATEGY**

### **PHASE 1: ADMIN APPROVAL SYSTEM** ⚡ (3-4 hours)

**Objective**: Enable admins to manage therapist applications with complete approval workflow.

#### **1.1 Enhanced Admin Therapist Controller**

**Update `mentara-api/src/admin/controllers/admin-therapist.controller.ts`:**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { AdminOnly } from 'src/decorators/admin-only.decorator';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  ApproveTherapistDtoSchema,
  RejectTherapistDtoSchema,
  UpdateTherapistStatusDtoSchema,
  PendingTherapistFiltersDtoSchema,
  type ApproveTherapistDto,
  type RejectTherapistDto,
  type UpdateTherapistStatusDto,
  type PendingTherapistFiltersDto
} from 'mentara-commons';
import { AdminTherapistService } from '../services/admin-therapist.service';

@Controller('admin/therapists')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@AdminOnly()
export class AdminTherapistController {
  private readonly logger = new Logger(AdminTherapistController.name);

  constructor(private readonly adminTherapistService: AdminTherapistService) {}

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  async getPendingApplications(
    @Query(new ZodValidationPipe(PendingTherapistFiltersDtoSchema)) filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} fetching pending therapist applications`);
    return this.adminTherapistService.getPendingApplications(filters);
  }

  @Get('applications')
  @HttpCode(HttpStatus.OK)
  async getAllApplications(
    @Query(new ZodValidationPipe(PendingTherapistFiltersDtoSchema)) filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} fetching all therapist applications`);
    return this.adminTherapistService.getAllApplications(filters);
  }

  @Get(':id/details')
  @HttpCode(HttpStatus.OK)
  async getApplicationDetails(
    @Param('id') therapistId: string,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} viewing therapist application ${therapistId}`);
    return this.adminTherapistService.getApplicationDetails(therapistId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveTherapist(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(ApproveTherapistDtoSchema)) approvalDto: ApproveTherapistDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} approving therapist ${therapistId}`);
    return this.adminTherapistService.approveTherapist(therapistId, adminId, approvalDto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectTherapist(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(RejectTherapistDtoSchema)) rejectionDto: RejectTherapistDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} rejecting therapist ${therapistId}`);
    return this.adminTherapistService.rejectTherapist(therapistId, adminId, rejectionDto);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateTherapistStatus(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(UpdateTherapistStatusDtoSchema)) statusDto: UpdateTherapistStatusDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} updating therapist ${therapistId} status to ${statusDto.status}`);
    return this.adminTherapistService.updateTherapistStatus(therapistId, adminId, statusDto);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getTherapistStatistics(@CurrentUserId() adminId: string) {
    this.logger.log(`Admin ${adminId} fetching therapist statistics`);
    return this.adminTherapistService.getTherapistStatistics();
  }
}
```

#### **1.2 Admin Therapist Service Implementation**

**Create `mentara-api/src/admin/services/admin-therapist.service.ts`:**
```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { NotificationService } from 'src/notifications/notification.service';
import { AuditLogService } from 'src/audit-logs/audit-log.service';
import {
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  PendingTherapistFiltersDto,
} from 'mentara-commons';

@Injectable()
export class AdminTherapistService {
  private readonly logger = new Logger(AdminTherapistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getPendingApplications(filters: PendingTherapistFiltersDto) {
    const where = {
      status: 'pending',
      ...(filters.province && { province: filters.province }),
      ...(filters.submittedAfter && {
        submissionDate: { gte: new Date(filters.submittedAfter) },
      }),
      ...(filters.providerType && { providerType: filters.providerType }),
    };

    const therapists = await this.prisma.therapist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { submissionDate: 'asc' }, // Oldest first for fairness
        { createdAt: 'asc' },
      ],
      take: filters.limit || 50,
    });

    const totalCount = await this.prisma.therapist.count({ where });

    return {
      therapists,
      totalCount,
      pendingCount: totalCount,
    };
  }

  async getAllApplications(filters: PendingTherapistFiltersDto) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.province && { province: filters.province }),
      ...(filters.submittedAfter && {
        submissionDate: { gte: new Date(filters.submittedAfter) },
      }),
      ...(filters.processedBy && { processedByAdminId: filters.processedBy }),
    };

    const therapists = await this.prisma.therapist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
        processedByAdmin: {
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
      orderBy: [
        { processingDate: 'desc' },
        { submissionDate: 'desc' },
      ],
      take: filters.limit || 100,
    });

    const totalCount = await this.prisma.therapist.count({ where });

    return {
      therapists,
      totalCount,
    };
  }

  async getApplicationDetails(therapistId: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      include: {
        user: true,
        processedByAdmin: {
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
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        assignedClients: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          take: 10,
        },
      },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    // Calculate additional metrics
    const totalReviews = therapist.reviews.length;
    const averageRating = totalReviews > 0
      ? therapist.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const clientCount = therapist.assignedClients.length;

    return {
      ...therapist,
      statistics: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        clientCount,
        yearsOfExperience: this.calculateYearsOfExperience(therapist.practiceStartDate),
      },
    };
  }

  async approveTherapist(therapistId: string, adminId: string, approvalDto: ApproveTherapistDto) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      include: { user: true },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    if (therapist.status !== 'pending') {
      throw new BadRequestException(`Therapist application is not pending (current status: ${therapist.status})`);
    }

    // Update therapist status
    const updatedTherapist = await this.prisma.therapist.update({
      where: { userId: therapistId },
      data: {
        status: 'approved',
        processingDate: new Date(),
        processedByAdminId: adminId,
        licenseVerified: approvalDto.verifyLicense || false,
        licenseVerifiedAt: approvalDto.verifyLicense ? new Date() : null,
        licenseVerifiedBy: approvalDto.verifyLicense ? adminId : null,
      },
    });

    // Send approval notification
    await this.notificationService.sendTherapistApprovalNotification(
      therapistId,
      approvalDto.approvalMessage,
    );

    // Log audit trail
    await this.auditLogService.logAdminAction(
      adminId,
      'THERAPIST_APPROVED',
      therapistId,
      {
        therapistEmail: therapist.user.email,
        approvalMessage: approvalDto.approvalMessage,
        licenseVerified: approvalDto.verifyLicense,
      },
    );

    this.logger.log(`Therapist ${therapistId} approved by admin ${adminId}`);

    return {
      success: true,
      message: 'Therapist approved successfully',
      therapist: updatedTherapist,
    };
  }

  async rejectTherapist(therapistId: string, adminId: string, rejectionDto: RejectTherapistDto) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      include: { user: true },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    if (therapist.status !== 'pending') {
      throw new BadRequestException(`Therapist application is not pending (current status: ${therapist.status})`);
    }

    // Update therapist status
    const updatedTherapist = await this.prisma.therapist.update({
      where: { userId: therapistId },
      data: {
        status: 'rejected',
        processingDate: new Date(),
        processedByAdminId: adminId,
      },
    });

    // Send rejection notification
    await this.notificationService.sendTherapistRejectionNotification(
      therapistId,
      rejectionDto.rejectionReason,
      rejectionDto.rejectionMessage,
    );

    // Log audit trail
    await this.auditLogService.logAdminAction(
      adminId,
      'THERAPIST_REJECTED',
      therapistId,
      {
        therapistEmail: therapist.user.email,
        rejectionReason: rejectionDto.rejectionReason,
        rejectionMessage: rejectionDto.rejectionMessage,
      },
    );

    this.logger.log(`Therapist ${therapistId} rejected by admin ${adminId}`);

    return {
      success: true,
      message: 'Therapist application rejected',
      therapist: updatedTherapist,
    };
  }

  async updateTherapistStatus(therapistId: string, adminId: string, statusDto: UpdateTherapistStatusDto) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      include: { user: true },
    });

    if (!therapist) {
      throw new NotFoundException(`Therapist with ID ${therapistId} not found`);
    }

    const updatedTherapist = await this.prisma.therapist.update({
      where: { userId: therapistId },
      data: {
        status: statusDto.status,
        processingDate: new Date(),
        processedByAdminId: adminId,
      },
    });

    // Log audit trail
    await this.auditLogService.logAdminAction(
      adminId,
      'THERAPIST_STATUS_UPDATED',
      therapistId,
      {
        therapistEmail: therapist.user.email,
        oldStatus: therapist.status,
        newStatus: statusDto.status,
        statusReason: statusDto.reason,
      },
    );

    this.logger.log(`Therapist ${therapistId} status updated to ${statusDto.status} by admin ${adminId}`);

    return {
      success: true,
      message: `Therapist status updated to ${statusDto.status}`,
      therapist: updatedTherapist,
    };
  }

  async getTherapistStatistics() {
    const [
      totalApplications,
      pendingApplications,
      approvedTherapists,
      rejectedApplications,
      recentApplications,
    ] = await Promise.all([
      this.prisma.therapist.count(),
      this.prisma.therapist.count({ where: { status: 'pending' } }),
      this.prisma.therapist.count({ where: { status: 'approved' } }),
      this.prisma.therapist.count({ where: { status: 'rejected' } }),
      this.prisma.therapist.count({
        where: {
          submissionDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const approvalRate = totalApplications > 0 
      ? Math.round((approvedTherapists / totalApplications) * 100) 
      : 0;

    return {
      totalApplications,
      pendingApplications,
      approvedTherapists,
      rejectedApplications,
      recentApplications,
      approvalRate,
    };
  }

  private calculateYearsOfExperience(startDate: Date): number {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    if (
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate())
    ) {
      years--;
    }
    return years;
  }
}
```

### **PHASE 2: CLIENT-THERAPIST REQUEST SYSTEM** ⚡ (3-4 hours)

**Objective**: Enable clients to send requests to therapists and therapists to respond.

#### **2.1 Database Schema Enhancement**

**Create new Prisma model in `mentara-api/prisma/models/therapist-requests.prisma`:**
```prisma
// Client-Therapist Request System
model ClientTherapistRequest {
  id          String              @id @default(uuid())
  clientId    String
  therapistId String
  
  // Request status and metadata
  status      ClientRequestStatus @default(PENDING)
  priority    RequestPriority     @default(NORMAL)
  
  // Timing
  requestedAt   DateTime  @default(now())
  respondedAt   DateTime?
  expiresAt     DateTime? // Auto-expire after 7 days
  
  // Messages and communication
  clientMessage     String? @db.Text // Initial message from client
  therapistResponse String? @db.Text // Response from therapist
  
  // Recommendation context
  recommendationRank Int?   // Position in original recommendation list (1st, 2nd, etc.)
  matchScore         Float? // Original compatibility score
  
  // Relations
  client    Client    @relation(fields: [clientId], references: [userId], onDelete: Cascade)
  therapist Therapist @relation(fields: [therapistId], references: [userId], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Constraints and indexes
  @@unique([clientId, therapistId]) // One active request per client-therapist pair
  @@index([status])
  @@index([requestedAt])
  @@index([expiresAt])
  @@index([clientId])
  @@index([therapistId])
}

enum ClientRequestStatus {
  PENDING     // Waiting for therapist response
  ACCEPTED    // Therapist accepted the client
  DECLINED    // Therapist declined the client
  EXPIRED     // Request expired without response
  CANCELLED   // Client cancelled the request
  WITHDRAWN   // Client withdrew after therapist acceptance
}

enum RequestPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

**Update existing models to include the new relations:**

**Add to `mentara-api/prisma/models/user.prisma` in Client model:**
```prisma
model Client {
  // ... existing fields ...
  
  // Therapist request relations
  sentRequests     ClientTherapistRequest[] @relation("ClientRequests")
  
  // ... rest of existing fields ...
}
```

**Add to `mentara-api/prisma/models/therapist.prisma`:**
```prisma
model Therapist {
  // ... existing fields ...
  
  // Client request relations
  receivedRequests ClientTherapistRequest[] @relation("TherapistRequests")
  
  // ... rest of existing fields ...
}
```

#### **2.2 Client Request Controller**

**Create `mentara-api/src/client/controllers/client-request.controller.ts`:**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  SendTherapistRequestDtoSchema,
  ClientRequestFiltersDtoSchema,
  type SendTherapistRequestDto,
  type ClientRequestFiltersDto,
} from 'mentara-commons';
import { ClientRequestService } from '../services/client-request.service';

@Controller('client/requests')
@UseGuards(JwtAuthGuard)
export class ClientRequestController {
  private readonly logger = new Logger(ClientRequestController.name);

  constructor(private readonly clientRequestService: ClientRequestService) {}

  @Post('therapist/:therapistId')
  @HttpCode(HttpStatus.CREATED)
  async sendTherapistRequest(
    @Param('therapistId') therapistId: string,
    @Body(new ZodValidationPipe(SendTherapistRequestDtoSchema)) requestDto: SendTherapistRequestDto,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(`Client ${clientId} sending request to therapist ${therapistId}`);
    return this.clientRequestService.sendTherapistRequest(clientId, therapistId, requestDto);
  }

  @Post('therapists/bulk')
  @HttpCode(HttpStatus.CREATED)
  async sendMultipleTherapistRequests(
    @Body() requestData: { therapistIds: string[]; message?: string; priority?: string },
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(`Client ${clientId} sending requests to ${requestData.therapistIds.length} therapists`);
    return this.clientRequestService.sendMultipleTherapistRequests(clientId, requestData);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyRequests(
    @Query(new ZodValidationPipe(ClientRequestFiltersDtoSchema)) filters: ClientRequestFiltersDto,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(`Client ${clientId} fetching their therapist requests`);
    return this.clientRequestService.getClientRequests(clientId, filters);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelRequest(
    @Param('id') requestId: string,
    @CurrentUserId() clientId: string,
  ) {
    this.logger.log(`Client ${clientId} cancelling request ${requestId}`);
    return this.clientRequestService.cancelRequest(requestId, clientId);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getRequestStatistics(@CurrentUserId() clientId: string) {
    this.logger.log(`Client ${clientId} fetching request statistics`);
    return this.clientRequestService.getClientRequestStatistics(clientId);
  }
}
```

#### **2.3 Therapist Request Controller**

**Create `mentara-api/src/therapist/controllers/therapist-request.controller.ts`:**
```typescript
import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  TherapistRequestResponseDtoSchema,
  TherapistRequestFiltersDtoSchema,
  type TherapistRequestResponseDto,
  type TherapistRequestFiltersDto,
} from 'mentara-commons';
import { TherapistRequestService } from '../services/therapist-request.service';

@Controller('therapist/requests')
@UseGuards(JwtAuthGuard)
export class TherapistRequestController {
  private readonly logger = new Logger(TherapistRequestController.name);

  constructor(private readonly therapistRequestService: TherapistRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getClientRequests(
    @Query(new ZodValidationPipe(TherapistRequestFiltersDtoSchema)) filters: TherapistRequestFiltersDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} fetching client requests`);
    return this.therapistRequestService.getTherapistRequests(therapistId, filters);
  }

  @Put(':id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptRequest(
    @Param('id') requestId: string,
    @Body(new ZodValidationPipe(TherapistRequestResponseDtoSchema)) responseDto: TherapistRequestResponseDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} accepting request ${requestId}`);
    return this.therapistRequestService.acceptClientRequest(requestId, therapistId, responseDto);
  }

  @Put(':id/decline')
  @HttpCode(HttpStatus.OK)
  async declineRequest(
    @Param('id') requestId: string,
    @Body(new ZodValidationPipe(TherapistRequestResponseDtoSchema)) responseDto: TherapistRequestResponseDto,
    @CurrentUserId() therapistId: string,
  ) {
    this.logger.log(`Therapist ${therapistId} declining request ${requestId}`);
    return this.therapistRequestService.declineClientRequest(requestId, therapistId, responseDto);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getRequestStatistics(@CurrentUserId() therapistId: string) {
    this.logger.log(`Therapist ${therapistId} fetching request statistics`);
    return this.therapistRequestService.getTherapistRequestStatistics(therapistId);
  }
}
```

### **PHASE 3: ENHANCED RECOMMENDATION FLOW** ⚡ (2 hours)

**Objective**: Enhance existing recommendation system for welcome page and first-time user flow.

#### **3.1 Enhanced Auth Endpoints for First-time Flow**

**Update `mentara-api/src/auth/auth.controller.ts` to add:**
```typescript
@Get('first-sign-in-status')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async getFirstSignInStatus(@CurrentUserId() userId: string) {
  this.logger.log(`Checking first sign-in status for user ${userId}`);
  return this.authService.getFirstSignInStatus(userId);
}

@Put('mark-recommendations-seen')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async markRecommendationsSeen(@CurrentUserId() userId: string) {
  this.logger.log(`Marking recommendations as seen for user ${userId}`);
  return this.authService.markRecommendationsSeen(userId);
}
```

**Update `mentara-api/src/auth/auth.service.ts` to add:**
```typescript
async getFirstSignInStatus(userId: string) {
  const client = await this.prisma.client.findUnique({
    where: { userId },
    select: { 
      hasSeenTherapistRecommendations: true,
      createdAt: true,
    },
  });

  if (!client) {
    throw new NotFoundException('Client profile not found');
  }

  return {
    isFirstTime: !client.hasSeenTherapistRecommendations,
    needsWelcomeFlow: !client.hasSeenTherapistRecommendations,
    memberSince: client.createdAt,
  };
}

async markRecommendationsSeen(userId: string) {
  const updatedClient = await this.prisma.client.update({
    where: { userId },
    data: { hasSeenTherapistRecommendations: true },
  });

  this.logger.log(`Marked recommendations as seen for user ${userId}`);

  return {
    success: true,
    message: 'Recommendations marked as seen',
    hasSeenTherapistRecommendations: updatedClient.hasSeenTherapistRecommendations,
  };
}
```

#### **3.2 Enhanced Welcome Page Recommendations**

**Update `mentara-api/src/therapist/therapist-recommendation.controller.ts` to add:**
```typescript
@Get('welcome')
@HttpCode(HttpStatus.OK)
async getWelcomePageRecommendations(
  @CurrentUserId() clientId: string,
  @Query('limit') limit?: string,
) {
  this.logger.log(`Getting welcome page recommendations for client ${clientId}`);
  
  const request: TherapistRecommendationRequest = {
    userId: clientId,
    limit: limit ? parseInt(limit) : 6, // Default 6 for welcome page
    includeInactive: false,
    welcomePageOptimized: true, // Special flag for welcome page
  };

  const recommendations = await this.therapistRecommendationService.getRecommendedTherapists(request);
  
  // Enhanced response for welcome page
  return {
    ...recommendations,
    welcomeMessage: this.generateWelcomeMessage(recommendations.userConditions),
    selectionGuidance: this.generateSelectionGuidance(recommendations.therapists.length),
    nextSteps: {
      selectTherapists: 'Choose 2-3 therapists you\'d like to connect with',
      sendRequests: 'We\'ll send your request to selected therapists',
      waitForResponses: 'Therapists typically respond within 24-48 hours',
    },
  };
}

private generateWelcomeMessage(conditions: string[]): string {
  const conditionCount = conditions.length;
  if (conditionCount === 0) {
    return 'Welcome! We\'ve found therapists who specialize in general mental health support.';
  } else if (conditionCount === 1) {
    return `Welcome! Based on your assessment, we\'ve found therapists who specialize in ${conditions[0]} support.`;
  } else {
    return `Welcome! Based on your assessment covering ${conditionCount} areas, we\'ve found therapists who can provide comprehensive support.`;
  }
}

private generateSelectionGuidance(therapistCount: number): string {
  if (therapistCount >= 6) {
    return 'Great news! We found many compatible therapists. Select 2-3 that feel like the best fit.';
  } else if (therapistCount >= 3) {
    return 'We found several compatible therapists for you. Feel free to select multiple options.';
  } else {
    return 'We found some compatible therapists. You can select all of them to maximize your options.';
  }
}
```

---

## 📋 **COMMONS SCHEMA ADDITIONS**

**Add to `mentara-commons/src/schemas/` the following new schema files:**

### **admin.ts enhancements:**
```typescript
// Admin Therapist Management Schemas
export const ApproveTherapistDtoSchema = z.object({
  approvalMessage: z.string().min(10, 'Approval message must be at least 10 characters').optional(),
  verifyLicense: z.boolean().default(false),
  grantSpecialPermissions: z.array(z.string()).optional(),
});

export const RejectTherapistDtoSchema = z.object({
  rejectionReason: z.enum([
    'incomplete_documentation',
    'invalid_license',
    'failed_verification',
    'policy_violation',
    'other'
  ]),
  rejectionMessage: z.string().min(20, 'Rejection message must be at least 20 characters'),
  allowReapplication: z.boolean().default(true),
});

export const UpdateTherapistStatusDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended', 'under_review']),
  reason: z.string().min(10, 'Status change reason required').optional(),
});

export const PendingTherapistFiltersDtoSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  province: z.string().optional(),
  submittedAfter: z.string().datetime().optional(),
  processedBy: z.string().optional(),
  providerType: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

// Type exports
export type ApproveTherapistDto = z.infer<typeof ApproveTherapistDtoSchema>;
export type RejectTherapistDto = z.infer<typeof RejectTherapistDtoSchema>;
export type UpdateTherapistStatusDto = z.infer<typeof UpdateTherapistStatusDtoSchema>;
export type PendingTherapistFiltersDto = z.infer<typeof PendingTherapistFiltersDtoSchema>;
```

### **client-requests.ts (new file):**
```typescript
import { z } from 'zod';

// Client Request Schemas
export const SendTherapistRequestDtoSchema = z.object({
  message: z.string().min(20, 'Message must be at least 20 characters').max(500, 'Message too long').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  preferredResponseTime: z.enum(['24_hours', '48_hours', '1_week']).default('48_hours'),
  recommendationRank: z.number().min(1).optional(), // Position in recommendation list
  matchScore: z.number().min(0).max(100).optional(), // Original compatibility score
});

export const ClientRequestFiltersDtoSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED']).optional(),
  therapistId: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

export const TherapistRequestResponseDtoSchema = z.object({
  responseMessage: z.string().min(10, 'Response message must be at least 10 characters').max(500),
  acceptClient: z.boolean(),
  suggestedNextSteps: z.string().optional(),
  schedulingPreferences: z.object({
    availableSlots: z.array(z.string()).optional(),
    sessionLength: z.enum(['30', '45', '60', '90']).optional(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  }).optional(),
});

export const TherapistRequestFiltersDtoSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  clientId: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

// Type exports
export type SendTherapistRequestDto = z.infer<typeof SendTherapistRequestDtoSchema>;
export type ClientRequestFiltersDto = z.infer<typeof ClientRequestFiltersDtoSchema>;
export type TherapistRequestResponseDto = z.infer<typeof TherapistRequestResponseDtoSchema>;
export type TherapistRequestFiltersDto = z.infer<typeof TherapistRequestFiltersDtoSchema>;
```

---

## 🔄 **MODULE INTEGRATION REQUIREMENTS**

### **Update Existing Services:**

#### **Notification Service Integration:**
**Add to `mentara-api/src/notifications/notification.service.ts`:**
```typescript
async sendTherapistApprovalNotification(therapistId: string, message?: string) {
  return this.createNotification({
    userId: therapistId,
    type: 'THERAPIST_APPROVED',
    title: 'Application Approved!',
    content: message || 'Congratulations! Your therapist application has been approved.',
    priority: 'HIGH',
    metadata: { approvalDate: new Date().toISOString() },
  });
}

async sendTherapistRejectionNotification(therapistId: string, reason: string, message?: string) {
  return this.createNotification({
    userId: therapistId,
    type: 'THERAPIST_REJECTED',
    title: 'Application Update',
    content: message || `Your application requires attention: ${reason}`,
    priority: 'HIGH',
    metadata: { rejectionReason: reason },
  });
}

async sendClientRequestNotification(therapistId: string, clientName: string, requestId: string) {
  return this.createNotification({
    userId: therapistId,
    type: 'CLIENT_REQUEST',
    title: 'New Client Request',
    content: `${clientName} would like to connect with you for therapy sessions.`,
    priority: 'MEDIUM',
    actionUrl: `/therapist/requests/${requestId}`,
    metadata: { requestId, clientName },
  });
}

async sendRequestResponseNotification(clientId: string, therapistName: string, accepted: boolean) {
  return this.createNotification({
    userId: clientId,
    type: accepted ? 'REQUEST_ACCEPTED' : 'REQUEST_DECLINED',
    title: accepted ? 'Request Accepted!' : 'Request Response',
    content: accepted 
      ? `Great news! ${therapistName} has accepted your request.`
      : `${therapistName} is unable to take on new clients at this time.`,
    priority: 'MEDIUM',
    metadata: { therapistName, requestAccepted: accepted },
  });
}
```

#### **Module Updates:**
**Update all relevant modules to include new controllers and services:**

**`mentara-api/src/admin/admin.module.ts`:**
```typescript
import { AdminTherapistController } from './controllers/admin-therapist.controller';
import { AdminTherapistService } from './services/admin-therapist.service';

@Module({
  controllers: [
    // ... existing controllers ...
    AdminTherapistController,
  ],
  providers: [
    // ... existing providers ...
    AdminTherapistService,
  ],
})
```

**`mentara-api/src/client/client.module.ts`:**
```typescript
import { ClientRequestController } from './controllers/client-request.controller';
import { ClientRequestService } from './services/client-request.service';

@Module({
  controllers: [
    // ... existing controllers ...
    ClientRequestController,
  ],
  providers: [
    // ... existing providers ...
    ClientRequestService,
  ],
})
```

**`mentara-api/src/therapist/therapist.module.ts`:**
```typescript
import { TherapistRequestController } from './controllers/therapist-request.controller';
import { TherapistRequestService } from './services/therapist-request.service';

@Module({
  controllers: [
    // ... existing controllers ...
    TherapistRequestController,
  ],
  providers: [
    // ... existing providers ...
    TherapistRequestService,
  ],
})
```

---

## 📊 **SUCCESS CRITERIA & VALIDATION**

### **Phase 1 Success Criteria:**
- [ ] Admin can view all pending therapist applications
- [ ] Admin can approve therapist with optional license verification
- [ ] Admin can reject therapist with reason and message
- [ ] Admin can update therapist status at any time
- [ ] All admin actions generate audit logs
- [ ] Notifications sent to therapists on status changes
- [ ] Statistics endpoint provides application metrics

### **Phase 2 Success Criteria:**
- [ ] Clients can send requests to individual therapists
- [ ] Clients can send bulk requests to multiple therapists
- [ ] Therapists can view all incoming client requests
- [ ] Therapists can accept/decline requests with messages
- [ ] Request status tracking throughout the lifecycle
- [ ] Automatic request expiration after 7 days
- [ ] Request statistics for both clients and therapists

### **Phase 3 Success Criteria:**
- [ ] First-time sign-in detection working correctly
- [ ] Welcome page recommendations optimized for new users
- [ ] Enhanced recommendation response with guidance
- [ ] Smooth integration with existing recommendation system
- [ ] Analytics tracking for welcome page interactions

### **Integration Success Criteria:**
- [ ] All endpoints properly secured with JWT authentication
- [ ] Zod validation working on all inputs
- [ ] Error handling consistent across all controllers
- [ ] Database migrations applied successfully
- [ ] All services integrated with notification system
- [ ] Performance optimized for high concurrency

---

## 🚀 **EXECUTION CHECKLIST**

### **Pre-Implementation:**
- [ ] Run database migration for new ClientTherapistRequest model
- [ ] Update mentara-commons with new schemas
- [ ] Verify all existing services are working

### **Implementation Order:**
1. **Start with Phase 1**: Admin approval system (highest priority)
2. **Then Phase 2**: Client-therapist request system
3. **Finally Phase 3**: Enhanced recommendation flow
4. **Integration**: Module updates and testing

### **Post-Implementation Testing:**
- [ ] Test all admin approval workflows
- [ ] Test client request sending (single and bulk)
- [ ] Test therapist request acceptance/decline
- [ ] Test first-time user flow end-to-end
- [ ] Verify notification delivery
- [ ] Performance test with concurrent requests

### **Documentation Requirements:**
- [ ] API documentation for all new endpoints
- [ ] Database schema documentation
- [ ] Integration guide for frontend team
- [ ] Error handling documentation

---

**⚡ This directive implements the complete backend infrastructure for Module 2 therapist matching. Execute in order with thorough testing at each phase.**

---

*Directive Created: 2025-01-15 by Project Manager*  
*Execution Status: ⏳ **READY FOR IMPLEMENTATION***  
*Module**: 2 - Therapist Matching System (Backend)*