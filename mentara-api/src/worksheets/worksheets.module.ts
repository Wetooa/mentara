import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorksheetsController } from './worksheets.controller';
import { WorksheetsService } from './worksheets.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { WorksheetUploadsController } from './worksheet-uploads.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [WorksheetsController, WorksheetUploadsController],
  providers: [WorksheetsService, PrismaService],
  exports: [WorksheetsService],
})
export class WorksheetsModule {}
