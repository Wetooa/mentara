import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  userId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @IsString()
  @IsOptional()
  adminLevel?: string;
}

export class UpdateAdminDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @IsString()
  @IsOptional()
  adminLevel?: string;
}

export interface AdminResponseDto {
  userId: string;
  permissions?: string[];
  adminLevel?: string;
  createdAt: Date;
  updatedAt: Date;
}
