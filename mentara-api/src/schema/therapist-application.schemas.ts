import {
  TherapistCreateInputSchema,
  TherapistUpdateInputSchema,
  UserCreateInputSchema,
} from 'prisma/generated/zod/inputTypeSchemas';
import { z } from 'zod';

export type CreateTherapistApplicationDto = z.infer<
  typeof TherapistCreateInputSchema & {
    user: typeof UserCreateInputSchema;
  }
>;

export type TherapistApplicationUpdateInputDto = z.infer<
  typeof TherapistUpdateInputSchema
>;

export const TherapistRecommendationRequestSchema = z.object({
  userId: z.string(),
  limit: z.number().optional(),
  includeInactive: z.boolean().optional(),
  province: z.string().optional(),
  maxHourlyRate: z.number().optional(),
});

export type TherapistRecommendationRequestDto = z.infer<
  typeof TherapistRecommendationRequestSchema
>;

export const TherapistRecommendationResponseSchema = z.object({
  totalCount: z.number(),
  userConditions: z.array(z.string()),
  therapists: z.array(z.any()),
  matchCriteria: z.object({
    primaryConditions: z.array(z.string()),
    secondaryConditions: z.array(z.string()),
    severityLevels: z.record(z.string()),
  }),
});
