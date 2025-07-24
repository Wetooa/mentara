import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

interface CreateMatchesDto {
  therapistIds: string[];
}

interface CreateMatchesResponse {
  success: boolean;
  message: string;
  data?: {
    successfulMatches: number;
    failedMatches: number;
    details: Array<{
      therapistId: string;
      status: 'success' | 'failed';
      reason?: string;
    }>;
  };
}

@ApiTags('therapist-matching')
@ApiBearerAuth('JWT-auth')
@Controller('therapist')
@UseGuards(JwtAuthGuard)
export class TherapistMatchController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('matches')
  @ApiOperation({
    summary: 'Create therapist matches',
    description: 'Create client-therapist relationships for selected therapists',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        therapistIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of therapist user IDs to match with',
        },
      },
      required: ['therapistIds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Matches created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async createMatches(
    @CurrentUserId() clientId: string,
    @Body() createMatchesDto: CreateMatchesDto,
  ): Promise<CreateMatchesResponse> {
    try {
      const { therapistIds } = createMatchesDto;

      if (!therapistIds || therapistIds.length === 0) {
        throw new BadRequestException('At least one therapist ID is required');
      }

      if (therapistIds.length > 10) {
        throw new BadRequestException('Cannot select more than 10 therapists at once');
      }

      // Verify client exists and is actually a client
      const client = await this.prisma.client.findUnique({
        where: { userId: clientId },
      });

      if (!client) {
        throw new BadRequestException('Client profile not found');
      }

      // Verify all therapists exist and are approved
      const therapists = await this.prisma.therapist.findMany({
        where: {
          userId: { in: therapistIds },
          status: 'APPROVED',
        },
        select: {
          userId: true,
        },
      });

      const foundTherapistIds = therapists.map(t => t.userId);
      const notFoundTherapistIds = therapistIds.filter(id => !foundTherapistIds.includes(id));

      const details: Array<{
        therapistId: string;
        status: 'success' | 'failed';
        reason?: string;
      }> = [];

      let successfulMatches = 0;
      let failedMatches = 0;

      // Handle not found therapists
      notFoundTherapistIds.forEach(therapistId => {
        details.push({
          therapistId,
          status: 'failed',
          reason: 'Therapist not found or not approved',
        });
        failedMatches++;
      });

      // Create matches for found therapists
      for (const therapistId of foundTherapistIds) {
        try {
          // Check if match already exists
          const existingMatch = await this.prisma.clientTherapist.findUnique({
            where: {
              clientId_therapistId: {
                clientId,
                therapistId,
              },
            },
          });

          if (existingMatch) {
            details.push({
              therapistId,
              status: 'failed',
              reason: 'Match already exists',
            });
            failedMatches++;
            continue;
          }

          // Create new match
          await this.prisma.clientTherapist.create({
            data: {
              clientId,
              therapistId,
              status: 'active',
            },
          });

          details.push({
            therapistId,
            status: 'success',
          });
          successfulMatches++;
        } catch (error) {
          details.push({
            therapistId,
            status: 'failed',
            reason: 'Database error creating match',
          });
          failedMatches++;
        }
      }

      return {
        success: successfulMatches > 0,
        message: successfulMatches > 0 
          ? `Successfully created ${successfulMatches} therapist matches`
          : 'No matches were created',
        data: {
          successfulMatches,
          failedMatches,
          details,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to create therapist matches',
      );
    }
  }
}