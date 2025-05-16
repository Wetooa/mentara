import { Module } from '@nestjs/common';
import { WorksheetsController } from './worksheets.controller';
import { WorksheetsService } from './worksheets.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { WorksheetUploadsController } from './worksheet-uploads.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/worksheets',
    }),
  ],
  controllers: [WorksheetsController, WorksheetUploadsController],
  providers: [WorksheetsService, PrismaService],
  exports: [WorksheetsService],
})
export class WorksheetsModule {}
