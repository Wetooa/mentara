import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, PrismaService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
