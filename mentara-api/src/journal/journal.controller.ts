import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/core/decorators/current-user-id.decorator';
import { JournalService } from './journal.service';
import type {
  JournalEntryCreateInputDto,
  JournalEntryUpdateInputDto,
} from './types/journal.dto';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUserId() userId: string,
    @Body() createDto: JournalEntryCreateInputDto,
  ) {
    return this.journalService.create(userId, createDto);
  }

  @Get('entries')
  findAll(
    @CurrentUserId() userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.journalService.findAll(userId, pageNum, limitNum);
  }

  @Get('entries/:id')
  findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.journalService.findOne(userId, id);
  }

  @Put('entries/:id')
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateDto: JournalEntryUpdateInputDto,
  ) {
    return this.journalService.update(userId, id, updateDto);
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.journalService.delete(userId, id);
  }
}

