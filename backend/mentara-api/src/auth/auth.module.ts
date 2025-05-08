import { Module } from '@nestjs/common';
import { ClerkStrategy } from './clerk.strategy';
import { PassportModule } from '@nestjs/passport';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [AuthController],
  providers: [ClerkStrategy, ClerkClientProvider, AuthService, PrismaService],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
