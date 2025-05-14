import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';

@Controller('auth')
@UseGuards(ClerkAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('is-signed-in')
  async checkIsSignedIn() {}

  @Get('users')
  async getAllUsers() {
    return await this.authService.getUsers();
  }

  @Post('is-admin')
  checkAdmin() {
    return true;
    // return this.authService.checkAdmin();
  }
}
