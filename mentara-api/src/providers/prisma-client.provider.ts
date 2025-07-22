import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    this.$on('query', (event: any) => {
      console.log('🔍 [PRISMA QUERY]', event.query);
      console.log('⏱️  [DURATION]', event.duration + 'ms');
      console.log('📊 [PARAMS]', event.params);
      console.log('---');
    });
    await this.$connect();
  }
}
