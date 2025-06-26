import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { TherapistCreateNestedOneWithoutReviewsInputSchema } from './TherapistCreateNestedOneWithoutReviewsInputSchema';
import { MeetingCreateNestedOneWithoutReviewsInputSchema } from './MeetingCreateNestedOneWithoutReviewsInputSchema';
import { ReviewHelpfulCreateNestedManyWithoutReviewInputSchema } from './ReviewHelpfulCreateNestedManyWithoutReviewInputSchema';

export const ReviewCreateWithoutClientInputSchema: z.ZodType<Prisma.ReviewCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  rating: z.number().int(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  isAnonymous: z.boolean().optional(),
  status: z.lazy(() => ReviewStatusSchema).optional(),
  moderatedBy: z.string().optional().nullable(),
  moderatedAt: z.coerce.date().optional().nullable(),
  moderationNote: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  helpfulCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutReviewsInputSchema),
  meeting: z.lazy(() => MeetingCreateNestedOneWithoutReviewsInputSchema).optional(),
  helpfulVotes: z.lazy(() => ReviewHelpfulCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export default ReviewCreateWithoutClientInputSchema;
