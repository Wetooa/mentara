import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { ClientService } from './client.service';
import { ClientWithUser } from 'src/types';
import { Prisma } from '@prisma/client';

@Controller('client')
@UseGuards(ClerkAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('profile')
  async getProfile(@CurrentUserId() id: string): Promise<ClientWithUser> {
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
    @Body() data: Prisma.ClientUpdateInput,
  ): Promise<ClientWithUser> {
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
}
