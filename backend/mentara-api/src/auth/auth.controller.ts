import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin')
  async checkAdmin(@CurrentUser user: User) {
    return this.authService.checkAdmin(user, new PrismaService());
  }
}
