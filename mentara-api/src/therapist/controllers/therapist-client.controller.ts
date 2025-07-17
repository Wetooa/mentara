import {
  Controller,
  Get,
  Param,
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

@ApiTags('therapist-client')
@ApiBearerAuth('JWT-auth')
@Controller('therapist/clients')
@UseGuards(JwtAuthGuard)
export class TherapistClientController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get('assigned')


  @ApiOperation({ 


    summary: 'Retrieve get assigned patients',


    description: 'Retrieve get assigned patients' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.OK)
  async getAssignedPatients(
    @CurrentUserId() therapistId: string,
  ): Promise<any[]> {
    return this.therapistManagementService.getAssignedPatients(therapistId);
  }

  @Get('all')


  @ApiOperation({ 


    summary: 'Retrieve get all clients',


    description: 'Retrieve get all clients' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.OK)
  async getAllClients(@CurrentUserId() therapistId: string): Promise<any[]> {
    return this.therapistManagementService.getAllClients(therapistId);
  }

  @Get(':id')


  @ApiOperation({ 


    summary: 'Retrieve get client by id',


    description: 'Retrieve get client by id' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<any> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }
}
