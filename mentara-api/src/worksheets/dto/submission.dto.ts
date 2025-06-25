import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  worksheetId: string;

  @IsString()
  userId: string;

  @IsObject()
  answers: Record<string, any>;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}

export class SubmitWorksheetDto {
  @IsObject()
  answers: Record<string, any>;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
