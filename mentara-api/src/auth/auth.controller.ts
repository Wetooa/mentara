import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { RegisterClientDto, RegisterTherapistDto } from 'src/types';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClerkAuthGuard)
  @Post('register/client')
  @HttpCode(HttpStatus.CREATED)
  async registerClient(
    @CurrentUserId() id: string,
    @Body() registerUserDto: RegisterClientDto,
  ) {
    return await this.authService.registerClient(id, registerUserDto);
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
  checkAdmin(@CurrentUserId() id: string): Promise<boolean> {
    return this.authService.checkAdmin(id);
  }
}
