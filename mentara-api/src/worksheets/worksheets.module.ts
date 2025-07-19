import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorksheetsController } from './worksheets.controller';
import { WorksheetsService } from './worksheets.service';
import { EnhancedWorksheetsService } from './services/enhanced-worksheets.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { WorksheetUploadsController } from './worksheet-uploads.controller';
import { EnhancedWorksheetsController } from './controllers/enhanced-worksheets.controller';
import { WorksheetCollaborationGateway } from './gateways/worksheet-collaboration.gateway';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    WorksheetsController,
    WorksheetUploadsController,
    EnhancedWorksheetsController,
  ],
  providers: [
    WorksheetsService,
    EnhancedWorksheetsService,
    WorksheetCollaborationGateway,
    PrismaService,
    SupabaseStorageService,
  ],
  exports: [WorksheetsService, EnhancedWorksheetsService],
})
export class WorksheetsModule {}
