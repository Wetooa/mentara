import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { WorksheetsService } from '../../worksheets/worksheets.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
} from 'mentara-commons';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('therapist-worksheets')
@ApiBearerAuth('JWT-auth')
@Controller('therapist')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('therapist')
export class TherapistWorksheetController {
  constructor(
    private readonly worksheetsService: WorksheetsService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('worksheets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get therapist worksheets',
    description: 'Retrieve all worksheets created by the therapist',
  })
  async getTherapistWorksheets(
    @CurrentUserId() therapistId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.worksheetsService.findAll(clientId, therapistId, status);
  }

  @Get('worksheets/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get worksheet by ID',
    description: 'Retrieve a specific worksheet by ID',
  })
  async getTherapistWorksheetById(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
  ) {
    return this.worksheetsService.findById(worksheetId);
  }

  @Post('worksheets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create worksheet (legacy)',
    description: 'Create a new worksheet with clientId in body',
  })
  async createTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Body() createWorksheetDto: WorksheetCreateInputDto & { clientId: string },
  ) {
    return this.worksheetsService.create(
      createWorksheetDto,
      createWorksheetDto.clientId,
      therapistId,
    );
  }

  @Put('worksheets/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update worksheet',
    description: 'Update an existing worksheet',
  })
  async updateTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(worksheetId, updateWorksheetDto);
  }

  // NEW MODULE 2 ENDPOINT
  @Post('clients/:clientId/worksheets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign worksheet to client',
    description: 'Create and assign a new worksheet to a specific client',
  })
  @ApiResponse({
    status: 201,
    description: 'Worksheet created and assigned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to assign worksheets to this client',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found or no active relationship',
  })
  async assignWorksheetToClient(
    @CurrentUserId() therapistId: string,
    @Param('clientId') clientId: string,
    @Body() createWorksheetDto: WorksheetCreateInputDto,
  ) {
    // Validate that therapist has an active relationship with the client
    const relationship = await this.prisma.clientTherapist.findUnique({
      where: {
        clientId_therapistId: {
          clientId,
          therapistId,
        },
      },
      include: {
        client: {
          include: { user: true },
        },
        therapist: {
          include: { user: true },
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException(
        'No relationship found between therapist and client',
      );
    }

    // Relationship exists, so we can assign worksheets
    // (All relationships are considered active now)

    // Validate worksheet data
    if (!createWorksheetDto.title || createWorksheetDto.title.trim() === '') {
      throw new BadRequestException('Worksheet title is required');
    }

    if (!createWorksheetDto.instructions || createWorksheetDto.instructions.trim() === '') {
      throw new BadRequestException('Worksheet instructions are required');
    }

    // Create the worksheet
    const worksheet = await this.worksheetsService.create(
      createWorksheetDto,
      clientId,
      therapistId,
    );

    // Send notification to client about new worksheet assignment
    try {
      await this.notificationsService.createWorksheetAssignedNotification(
        clientId,
        worksheet.id,
        createWorksheetDto.title,
        `${relationship.therapist.user.firstName} ${relationship.therapist.user.lastName}`,
      );
    } catch (error) {
      // Log notification error but don't fail the worksheet creation
      console.error('Failed to create worksheet notification:', error);
    }

    return {
      success: true,
      message: 'Worksheet assigned successfully',
      data: {
        worksheet,
        assignedTo: {
          id: relationship.client.userId,
          name: `${relationship.client.user.firstName} ${relationship.client.user.lastName}`,
        },
        assignedBy: {
          id: therapistId,
          name: `${relationship.therapist.user.firstName} ${relationship.therapist.user.lastName}`,
        },
      },
    };
  }
}
