import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ClerkAuthGuard } from 'src/guards/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { AuthService } from './auth.service';
import { ClientCreateDto, TherapistCreateDto } from '../../schema/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClerkAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registrations per 5 minutes
  @Post('register/client')
  @HttpCode(HttpStatus.CREATED)
  async registerClient(
    @CurrentUserId() id: string,
    @Body() registerUserDto: ClientCreateDto,
  ) {
    return await this.authService.registerClient(id, registerUserDto);
  }

  @UseGuards(ClerkAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 therapist registrations per 10 minutes
  @Post('register/therapist')
  @HttpCode(HttpStatus.CREATED)
  async registerTherapist(
    @CurrentUserId() id: string,
    @Body() registerTherapistDto: TherapistCreateDto,
  ) {
    return await this.authService.registerTherapist(id, registerTherapistDto);
  }

  @UseGuards(ClerkAuthGuard)
  @Get('me')
  async getMe(@CurrentUserId() id: string) {
    return await this.authService.getUser(id);
  }

  @UseGuards(ClerkAuthGuard)
  @Get('users')
  async getAllUsers() {
    return await this.authService.getUsers();
  }

  @UseGuards(ClerkAuthGuard)
  @Post('is-admin')
  checkAdmin(@CurrentUserId() id: string): Promise<boolean> {
    return this.authService.checkAdmin(id);
  }

  @UseGuards(ClerkAuthGuard)
  @Post('force-logout')
  @HttpCode(HttpStatus.OK)
  async forceLogout(@CurrentUserId() id: string) {
    return await this.authService.forceLogout(id);
  }
}
