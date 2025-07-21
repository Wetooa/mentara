import type { UserResponse, AuthResponse } from '../../auth/types';

// Define UserProfileResponse locally since it's only used here
interface UserProfileResponse extends UserResponse {
  fullName?: string;
}

/**
 * User response DTO for public API endpoints
 */
export class UserResponseDto implements UserResponse {
  id: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  isActive?: boolean;
  isVerified?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.middleName = user.middleName;
    this.lastName = user.lastName;
    this.birthDate = user.birthDate?.toISOString();
    this.address = user.address;
    this.role = user.role;
    this.bio = user.bio;
    this.avatarUrl = user.avatarUrl;
    this.coverImageUrl = user.coverImageUrl;
    this.phoneNumber = user.phoneNumber;
    this.timezone = user.timezone;
    this.language = user.language;
    this.theme = user.theme;
    this.isActive = user.isActive;
    this.isVerified = user.isVerified;
    this.emailVerified = user.emailVerified;
    this.lastLoginAt = user.lastLoginAt?.toISOString();
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
  }

  /**
   * Create UserResponseDto from Prisma User object
   */
  static fromPrismaUser(user: any): UserResponseDto {
    return new UserResponseDto(user);
  }

  /**
   * Create array of UserResponseDto from Prisma User array
   */
  static fromPrismaUsers(users: any[]): UserResponseDto[] {
    return users.map(user => UserResponseDto.fromPrismaUser(user));
  }
}

/**
 * User profile response DTO with additional computed fields
 */
export class UserProfileResponseDto extends UserResponseDto implements UserProfileResponse {
  fullName?: string;

  constructor(user: any) {
    super(user);
    this.fullName = this.computeFullName();
  }

  private computeFullName(): string | undefined {
    const parts = [this.firstName, this.middleName, this.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  /**
   * Create UserProfileResponseDto from Prisma User object
   */
  static fromPrismaUser(user: any): UserProfileResponseDto {
    return new UserProfileResponseDto(user);
  }
}

/**
 * Authentication response DTO
 */
export class AuthResponseDto implements AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
  };
  token: string;
  message: string;

  constructor(user: any, token: string, message: string = 'Authentication successful') {
    // Create AuthUser object with required fields
    this.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      emailVerified: user.emailVerified || false,
    };
    this.token = token;
    this.message = message;
  }
}