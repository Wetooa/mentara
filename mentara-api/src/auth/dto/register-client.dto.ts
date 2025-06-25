import { IsString, IsOptional, IsDateString } from 'class-validator';

export class RegisterClientDto {
  @IsString()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  mobile: string;

  @IsString()
  province: string;
}
