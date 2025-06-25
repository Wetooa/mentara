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

// DTOs for registration (clerkId removed since it comes from auth)
export class RegisterUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'therapist' | 'moderator' | 'admin';
  middleName?: string;
  birthDate?: Date;
  address?: string;
}

export class RegisterTherapistDto extends RegisterUserDto {
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense?: Date;
  isLicenseActive: string;
  yearsOfExperience: string;
  areasOfExpertise: any;
  assessmentTools: any;
  therapeuticApproachesUsedList: any;
  languagesOffered: any;
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: any;
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClerkAuthGuard)
  @Post('register/user')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @CurrentUserId() clerkId: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return await this.authService.registerUser(clerkId, registerUserDto);
  }

  @UseGuards(ClerkAuthGuard)
  @Post('register/therapist')
  @HttpCode(HttpStatus.CREATED)
  async registerTherapist(
    @CurrentUserId() clerkId: string,
    @Body() registerTherapistDto: RegisterTherapistDto,
  ) {
    return await this.authService.registerTherapist(
      clerkId,
      registerTherapistDto,
    );
  }

  @UseGuards(ClerkAuthGuard)
  @Get('me')
  async getMe(@CurrentUserId() userId: string) {
    return await this.authService.getUser(userId);
  }

  @UseGuards(ClerkAuthGuard)
  @Get('users')
  async getAllUsers() {
    return await this.authService.getUsers();
  }

  @UseGuards(ClerkAuthGuard)
  @Post('is-admin')
  checkAdmin(@CurrentUserId() userId: string) {
    return this.authService.checkAdmin(userId);
  }
}
