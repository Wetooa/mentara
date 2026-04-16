import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecommendedTherapistDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty({ type: [String] })
  expertise: string[];

  @ApiProperty({ type: [String] })
  illnessSpecializations: string[];

  @ApiProperty({ type: [String] })
  therapeuticApproaches: string[];

  @ApiProperty()
  yearsOfExperience: number;

  @ApiProperty()
  hourlyRate: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  matchScore: number;

  @ApiProperty({ type: [String] })
  matchReasons: string[];
}

export class RecommendedCommunityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  memberCount: number;

  @ApiProperty()
  matchScore: number;

  @ApiProperty({ type: [String] })
  matchReasons: string[];
}

export class TherapistRecommendationResponseDataDto {
  @ApiProperty({ type: [RecommendedTherapistDto] })
  therapists: RecommendedTherapistDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [String] })
  userConditions: string[];
}

export class TherapistRecommendationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: TherapistRecommendationResponseDataDto })
  data: TherapistRecommendationResponseDataDto;

  @ApiPropertyOptional()
  message?: string;
}

export class CommunityRecommendationResponseDataDto {
  @ApiProperty({ type: [RecommendedCommunityDto] })
  communities: RecommendedCommunityDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [String] })
  userConditions: string[];
}

export class CommunityRecommendationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: CommunityRecommendationResponseDataDto })
  data: CommunityRecommendationResponseDataDto;

  @ApiPropertyOptional()
  message?: string;
}

export class RecommendationResponseDataDto {
  @ApiProperty({ type: [RecommendedTherapistDto] })
  therapists: RecommendedTherapistDto[];

  @ApiProperty({ type: [RecommendedCommunityDto] })
  communities: RecommendedCommunityDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [String] })
  userConditions: string[];

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      pastTherapyExperiences: { type: 'string', nullable: true },
      medicationHistory: { type: 'string', nullable: true },
      accessibilityNeeds: { type: 'string', nullable: true },
    },
  })
  userContext?: {
    pastTherapyExperiences?: string | null;
    medicationHistory?: string | null;
    accessibilityNeeds?: string | null;
  };
}

export class RecommendationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: RecommendationResponseDataDto })
  data: RecommendationResponseDataDto;

  @ApiPropertyOptional()
  message?: string;
}
