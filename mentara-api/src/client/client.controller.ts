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
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { ClientService } from './client.service';
import {
  ClientResponse,
  ClientUpdateDto,
  TherapistResponse,
} from 'schema/auth';

@Controller('client')
@UseGuards(ClerkAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('profile')
  async getProfile(@CurrentUserId() id: string): Promise<ClientResponse> {
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
    @Body() data: ClientUpdateDto,
  ): Promise<ClientResponse> {
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
  async getAssignedTherapist(
    @CurrentUserId() id: string,
  ): Promise<{ therapist: TherapistResponse | null }> {
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

  @Post('therapist')
  async assignTherapist(
    @CurrentUserId() id: string,
    @Body() data: { therapistId: string },
  ): Promise<{ therapist: TherapistResponse }> {
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
