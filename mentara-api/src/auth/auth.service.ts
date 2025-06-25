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
import {
  RegisterUserDto,
  RegisterTherapistDto,
  ApiResponse,
  User,
} from 'src/types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async registerUser(
    clerkId: string,
    registerUserDto: RegisterUserDto,
  ): Promise<ApiResponse<User>> {
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
        data: user as User,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error(
        'User registration error:',
        error instanceof Error ? error.message : error,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async registerTherapist(
    clerkId: string,
    registerTherapistDto: RegisterTherapistDto,
  ): Promise<ApiResponse<{ user: User; therapist: any }>> {
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

      // Create therapist
      const therapist = await this.prisma.therapist.create({
        data: {
          user: { connect: { clerkId } },
          approved: false,
          status: 'pending',
          firstName: registerTherapistDto.firstName,
          lastName: registerTherapistDto.lastName,
          email: registerTherapistDto.email,
          mobile: registerTherapistDto.mobile,
          province: registerTherapistDto.province,
          providerType: registerTherapistDto.providerType,
          professionalLicenseType: registerTherapistDto.professionalLicenseType,
          isPRCLicensed: registerTherapistDto.isPRCLicensed,
          prcLicenseNumber: registerTherapistDto.prcLicenseNumber,
          expirationDateOfLicense: registerTherapistDto.expirationDateOfLicense,
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
        },
      });

      return {
        success: true,
        data: {
          user: user as User,
          therapist: therapist,
        },
        message: 'Therapist registered successfully',
      };
    } catch (error) {
      console.error(
        'Therapist registration error:',
        error instanceof Error ? error.message : error,
      );
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

  async checkAdmin(@CurrentUserId() userId: string): Promise<ApiResponse<any>> {
    try {
      const adminUser = await this.prisma.adminUser.findUnique({
        where: { id: userId },
      });

      if (!adminUser) {
        throw new ForbiddenException('Not authorized as admin');
      }

      return {
        success: true,
        data: {
          id: adminUser.id,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
      };
    } catch (error) {
      console.error(
        'Admin authentication error:',
        error instanceof Error ? error.message : error,
      );
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}
