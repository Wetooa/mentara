import { Module } from '@nestjs/common';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  controllers: [JournalController],
  providers: [JournalService, PrismaService],
  exports: [JournalService],
})
export class JournalModule {}

