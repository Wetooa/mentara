import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EnhancedWorksheetsService } from '../services/enhanced-worksheets.service';

@Controller('worksheets/enhanced')
@UseGuards(JwtAuthGuard)
@ApiTags('Enhanced Worksheets')
@ApiBearerAuth()
export class EnhancedWorksheetsController {
  constructor(
    private readonly enhancedWorksheetsService: EnhancedWorksheetsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all enhanced worksheets with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Enhanced worksheets retrieved successfully' })
  async getEnhancedWorksheets(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.enhancedWorksheetsService.getAllWorksheets(
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enhanced worksheet by ID' })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiResponse({ status: 200, description: 'Enhanced worksheet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Worksheet not found' })
  async getEnhancedWorksheet(@Param('id', ParseUUIDPipe) id: string) {
    return this.enhancedWorksheetsService.getWorksheet(id);
  }
}