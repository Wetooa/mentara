import { IsString, IsOptional, MaxLength } from 'class-validator';

export class DeactivateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

export interface UserDeactivationResponseDto {
  message: string;
  deactivatedAt: Date;
  reason?: string;
  deactivatedBy?: string;
}
