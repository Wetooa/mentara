import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterTherapistDto } from 'src/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClerkAuthGuard)
  @Post('register/user')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @CurrentUserId() id: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return await this.authService.registerUser(id, registerUserDto);
  }

  @UseGuards(ClerkAuthGuard)
  @Post('register/therapist')
  @HttpCode(HttpStatus.CREATED)
  async registerTherapist(
    @CurrentUserId() id: string,
    @Body() registerTherapistDto: RegisterTherapistDto,
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
  checkAdmin(@CurrentUserId() id: string) {
    return this.authService.checkAdmin(id);
  }
}
