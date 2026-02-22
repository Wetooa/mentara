import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { TherapistListService } from '../services/therapist-list.service';
import type {
  TherapistListQuery,
  TherapistListResponse,
  TherapistListItem,
} from '../types/therapist.dto';

@ApiTags('therapists')
@ApiBearerAuth('JWT-auth')
@Controller('therapists')
@UseGuards(JwtAuthGuard)
export class TherapistListController {
  constructor(private readonly therapistListService: TherapistListService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of therapists',
    description: 'Retrieve a paginated list of approved therapists with filtering and sorting options',
  })
  @ApiResponse({
    status: 200,
    description: 'Therapists retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        therapists: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true },
                  bio: { type: 'string', nullable: true },
                },
              },
              specialties: { type: 'array', items: { type: 'string' } },
              languages: { type: 'array', items: { type: 'string' } },
              province: { type: 'string' },
              hourlyRate: { type: 'number' },
              rating: { type: 'number' },
              reviewCount: { type: 'number' },
              yearsOfExperience: { type: 'number' },
              isActive: { type: 'boolean' },
              licenseVerified: { type: 'boolean' },
            },
          },
        },
        totalCount: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of therapists per page (max 100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of therapists to skip' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or specialty' })
  @ApiQuery({ name: 'specialties', required: false, type: [String], description: 'Filter by specialties' })
  @ApiQuery({ name: 'languages', required: false, type: [String], description: 'Filter by languages offered' })
  @ApiQuery({ name: 'province', required: false, type: String, description: 'Filter by province' })
  @ApiQuery({ name: 'minHourlyRate', required: false, type: Number, description: 'Minimum hourly rate' })
  @ApiQuery({ name: 'maxHourlyRate', required: false, type: Number, description: 'Maximum hourly rate' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Minimum rating (0-5)' })
  @ApiQuery({ name: 'minExperience', required: false, type: Number, description: 'Minimum years of experience' })
  @ApiQuery({ name: 'maxExperience', required: false, type: Number, description: 'Maximum years of experience' })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    enum: ['rating', 'experience', 'hourlyRate', 'name'],
    description: 'Sort therapists by field' 
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    enum: ['asc', 'desc'],
    description: 'Sort order' 
  })
  @HttpCode(HttpStatus.OK)
  async getTherapistList(
    @Query() query: TherapistListQuery,
  ): Promise<TherapistListResponse> {
    return this.therapistListService.getTherapistList(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get therapist by ID',
    description: 'Retrieve detailed information about a specific therapist',
  })
  @ApiResponse({
    status: 200,
    description: 'Therapist retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
          },
        },
        specialties: { type: 'array', items: { type: 'string' } },
        languages: { type: 'array', items: { type: 'string' } },
        areasOfExpertise: { type: 'array', items: { type: 'string' } },
        approaches: { type: 'array', items: { type: 'string' } },
        province: { type: 'string' },
        hourlyRate: { type: 'number' },
        rating: { type: 'number' },
        reviewCount: { type: 'number' },
        yearsOfExperience: { type: 'number' },
        isActive: { type: 'boolean' },
        licenseVerified: { type: 'boolean' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Therapist not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'Therapist ID (userId)' })
  @HttpCode(HttpStatus.OK)
  async getTherapistById(
    @Param('id') id: string,
  ): Promise<TherapistListItem> {
    return this.therapistListService.getTherapistById(id);
  }
}