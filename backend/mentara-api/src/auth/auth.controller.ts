import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('admin')
  @HttpCode(HttpStatus.OK)
  async checkAdmin(@CurrentUser() user: User) {
    return this.authService.checkAdmin(user, this.prismaService);
  }
}
