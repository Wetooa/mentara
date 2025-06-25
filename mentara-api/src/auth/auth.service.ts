import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { UserRole } from 'src/utils/role-utils';

// Import DTOs from controller
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

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async registerUser(clerkId: string, registerUserDto: RegisterUserDto) {
    try {
      // Validate role
      if (!Object.values(UserRole).includes(registerUserDto.role as UserRole)) {
        registerUserDto.role = UserRole.USER;
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { clerkId: clerkId },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user
      const user = await this.prisma.user.create({
        data: {
          clerkId: clerkId,
          email: registerUserDto.email,
          firstName: registerUserDto.firstName,
          lastName: registerUserDto.lastName,
          middleName: registerUserDto.middleName,
          birthDate: registerUserDto.birthDate,
          address: registerUserDto.address,
          role: registerUserDto.role,
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('User registration error:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('User registration failed');
    }
  }

  async registerTherapist(
    clerkId: string,
    registerTherapistDto: RegisterTherapistDto,
  ) {
    try {
      // Validate role
      if (
        !Object.values(UserRole).includes(registerTherapistDto.role as UserRole)
      ) {
        registerTherapistDto.role = UserRole.USER;
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { clerkId: clerkId },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // Create user first
      const user = await this.prisma.user.create({
        data: {
          clerkId: clerkId,
          email: registerTherapistDto.email,
          firstName: registerTherapistDto.firstName,
          lastName: registerTherapistDto.lastName,
          middleName: registerTherapistDto.middleName,
          birthDate: registerTherapistDto.birthDate,
          address: registerTherapistDto.address,
          role: registerTherapistDto.role,
        },
      });

      // Create therapist application
      const therapistApplication =
        await this.prisma.therapistApplication.create({
          data: {
            clerkUserId: clerkId,
            firstName: registerTherapistDto.firstName,
            lastName: registerTherapistDto.lastName,
            email: registerTherapistDto.email,
            mobile: registerTherapistDto.mobile,
            province: registerTherapistDto.province,
            providerType: registerTherapistDto.providerType,
            professionalLicenseType:
              registerTherapistDto.professionalLicenseType,
            isPRCLicensed: registerTherapistDto.isPRCLicensed,
            prcLicenseNumber: registerTherapistDto.prcLicenseNumber,
            expirationDateOfLicense:
              registerTherapistDto.expirationDateOfLicense,
            isLicenseActive: registerTherapistDto.isLicenseActive,
            yearsOfExperience: registerTherapistDto.yearsOfExperience,
            areasOfExpertise: registerTherapistDto.areasOfExpertise,
            assessmentTools: registerTherapistDto.assessmentTools,
            therapeuticApproachesUsedList:
              registerTherapistDto.therapeuticApproachesUsedList,
            languagesOffered: registerTherapistDto.languagesOffered,
            providedOnlineTherapyBefore:
              registerTherapistDto.providedOnlineTherapyBefore,
            comfortableUsingVideoConferencing:
              registerTherapistDto.comfortableUsingVideoConferencing,
            weeklyAvailability: registerTherapistDto.weeklyAvailability,
            preferredSessionLength: registerTherapistDto.preferredSessionLength,
            accepts: registerTherapistDto.accepts,
            privateConfidentialSpace:
              registerTherapistDto.privateConfidentialSpace,
            compliesWithDataPrivacyAct:
              registerTherapistDto.compliesWithDataPrivacyAct,
            professionalLiabilityInsurance:
              registerTherapistDto.professionalLiabilityInsurance,
            complaintsOrDisciplinaryActions:
              registerTherapistDto.complaintsOrDisciplinaryActions,
            willingToAbideByPlatformGuidelines:
              registerTherapistDto.willingToAbideByPlatformGuidelines,
            applicationData: JSON.parse(JSON.stringify(registerTherapistDto)), // Store all data as JSON
          },
        });

      return {
        success: true,
        user: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        therapistApplication: {
          id: therapistApplication.id,
          status: therapistApplication.status,
        },
      };
    } catch (error) {
      console.error('Therapist registration error:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Therapist registration failed');
    }
  }

  async getUsers() {
    return clerkClient.users.getUserList();
  }

  async getUser(userId: string) {
    return clerkClient.users.getUser(userId);
  }

  async checkAdmin(@CurrentUserId() userId: string) {
    try {
      const adminUser = await this.prisma.adminUser.findUnique({
        where: { id: userId },
      });

      if (!adminUser) {
        throw new ForbiddenException('Not authorized as admin');
      }

      return {
        success: true,
        admin: {
          id: adminUser.id,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
      };
    } catch (error) {
      console.error('Admin authentication error:', error);

      // Re-throw NestJS exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // For other errors, throw an internal server error
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}
