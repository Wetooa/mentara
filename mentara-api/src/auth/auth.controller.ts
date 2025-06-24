import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
@UseGuards(ClerkAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async getMe(@CurrentUserId() userId: string) {
    return await this.authService.getUser(userId);
  }

  @Get('users')
  async getAllUsers() {
    return await this.authService.getUsers();
  }

  @Post('is-admin')
  checkAdmin(@CurrentUserId() userId: string) {
    return this.authService.checkAdmin(userId);
  }
}
