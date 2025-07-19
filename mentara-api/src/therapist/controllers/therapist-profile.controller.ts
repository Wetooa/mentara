import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { TherapistManagementService } from '../therapist-management.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
// Using any type to avoid conflicts with service definitions

@ApiTags('therapist-profile')
@ApiBearerAuth('JWT-auth')
@Controller('therapist/profile')
@UseGuards(JwtAuthGuard)
export class TherapistProfileController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve get therapist profile',

    description: 'Retrieve get therapist profile',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getTherapistProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<any> {
    return this.therapistManagementService.getTherapistProfile(therapistId);
  }

  @Put()
  @ApiOperation({
    summary: 'Update update therapist profile',

    description: 'Update update therapist profile',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updateTherapistProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: any,
  ): Promise<any> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }

  @Put('specializations')
  @ApiOperation({
    summary: 'Update update therapist specializations',

    description: 'Update update therapist specializations',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updateTherapistSpecializations(
    @CurrentUserId() therapistId: string,
    @Body() data: any,
  ): Promise<any> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }
}
