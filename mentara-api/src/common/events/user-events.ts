import { BaseDomainEvent, EventMetadata } from './interfaces/domain-event.interface';

// User Lifecycle Events

export interface UserRegisteredData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  registrationMethod: 'email' | 'oauth' | 'invitation';
}

export class UserRegisteredEvent extends BaseDomainEvent<UserRegisteredData> {
  constructor(data: UserRegisteredData, metadata?: EventMetadata) {
    super(data.userId, 'User', data, metadata);
  }
}

export interface UserLoginData {
  userId: string;
  email: string;
  loginMethod: 'email' | 'oauth';
  isSuccessful: boolean;
  failureReason?: string;
}

export class UserLoginEvent extends BaseDomainEvent<UserLoginData> {
  constructor(data: UserLoginData, metadata?: EventMetadata) {
    super(data.userId, 'User', data, metadata);
  }
}

export interface UserLogoutData {
  userId: string;
  sessionDuration: number; // in seconds
  logoutMethod: 'manual' | 'timeout' | 'forced';
}

export class UserLogoutEvent extends BaseDomainEvent<UserLogoutData> {
  constructor(data: UserLogoutData, metadata?: EventMetadata) {
    super(data.userId, 'User', data, metadata);
  }
}

export interface UserProfileUpdatedData {
  userId: string;
  updatedFields: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
}

export class UserProfileUpdatedEvent extends BaseDomainEvent<UserProfileUpdatedData> {
  constructor(data: UserProfileUpdatedData, metadata?: EventMetadata) {
    super(data.userId, 'User', data, metadata);
  }
}

export interface UserDeactivatedData {
  userId: string;
  reason: string;
  deactivatedBy: string; // userId of admin who deactivated
  isTemporary: boolean;
  reactivationDate?: Date;
}

export class UserDeactivatedEvent extends BaseDomainEvent<UserDeactivatedData> {
  constructor(data: UserDeactivatedData, metadata?: EventMetadata) {
    super(data.userId, 'User', data, metadata);
  }
}

export interface UserReactivatedData {
  userId: string;
  reactivatedBy: string;
  inactiveDuration: number; // in days
}

export class UserReactivatedEvent extends BaseDomainEvent<UserReactivatedData> {
  constructor(data: UserReactivatedData, metadata?: EventMetadata) {
    super(data.userId, 'User', data, metadata);
  }
}