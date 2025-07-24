import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientService } from './client.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
// Import will be resolved via service return type
import type { UpdateClientDto, TherapistRecommendation } from './types';

@ApiTags('clients')
@ApiBearerAuth('JWT-auth')
@Controller('client')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Retrieve get profile',

    description: 'Retrieve get profile',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUserId() id: string) {
    try {
      return await this.clientService.getProfile(id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch client profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('profile')
  async updateProfile(
    @CurrentUserId() id: string,
    @Body() data: UpdateClientDto,
  ) {
    try {
      return await this.clientService.updateProfile(id, data);
    } catch (error) {
      throw new HttpException(
        `Failed to update client profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('needs-therapist-recommendations')
  @ApiOperation({
    summary: 'Retrieve needs therapist recommendations',

    description: 'Retrieve needs therapist recommendations',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async needsTherapistRecommendations(
    @CurrentUserId() id: string,
  ): Promise<{ needsTherapistRecommendations: boolean }> {
    try {
      const needs = await this.clientService.needsTherapistRecommendations(id);
      return { needsTherapistRecommendations: needs };
    } catch (error) {
      throw new HttpException(
        `Failed to check therapist recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('mark-therapist-recommendations-seen')
  @ApiOperation({
    summary: 'Update mark therapist recommendations seen',

    description: 'Update mark therapist recommendations seen',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markTherapistRecommendationsSeen(
    @CurrentUserId() id: string,
  ): Promise<{ success: boolean }> {
    try {
      await this.clientService.markTherapistRecommendationsSeen(id);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        `Failed to mark therapist recommendations as seen: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('therapist')
  @ApiOperation({
    summary: 'Retrieve get assigned therapist',

    description: 'Retrieve get assigned therapist',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAssignedTherapist(
    @CurrentUserId() id: string,
  ): Promise<{ therapist: TherapistRecommendation | null }> {
    try {
      const therapist = await this.clientService.getAssignedTherapist(id);
      return { therapist };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch assigned therapist: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('therapists')
  @ApiOperation({
    summary: 'Retrieve all assigned therapists',
    description: 'Retrieve all active assigned therapists for the client',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAssignedTherapists(
    @CurrentUserId() id: string,
  ): Promise<{ therapists: TherapistRecommendation[] }> {
    try {
      const therapists = await this.clientService.getAssignedTherapists(id);
      return { therapists };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch assigned therapists: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('therapist')
  @ApiOperation({
    summary: 'Create assign therapist',

    description: 'Create assign therapist',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignTherapist(
    @CurrentUserId() id: string,
    @Body() data: { therapistId: string },
  ): Promise<{ therapist: TherapistRecommendation }> {
    try {
      const therapist = await this.clientService.assignTherapist(
        id,
        data.therapistId,
      );
      return { therapist };
    } catch (error) {
      throw new HttpException(
        `Failed to assign therapist: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error && error.message.includes('not found')
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('therapist')
  @ApiOperation({
    summary: 'Delete remove therapist',

    description: 'Delete remove therapist',
  })
  @ApiResponse({
    status: 200,

    description: 'Deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeTherapist(
    @CurrentUserId() id: string,
  ): Promise<{ success: boolean }> {
    try {
      await this.clientService.removeTherapist(id);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        `Failed to remove therapist: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error && error.message.includes('not found')
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
