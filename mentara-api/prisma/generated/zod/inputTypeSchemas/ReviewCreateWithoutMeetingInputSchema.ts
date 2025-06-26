import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { ClientCreateNestedOneWithoutReviewsInputSchema } from './ClientCreateNestedOneWithoutReviewsInputSchema';
import { TherapistCreateNestedOneWithoutReviewsInputSchema } from './TherapistCreateNestedOneWithoutReviewsInputSchema';
import { ReviewHelpfulCreateNestedManyWithoutReviewInputSchema } from './ReviewHelpfulCreateNestedManyWithoutReviewInputSchema';

export const ReviewCreateWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewCreateWithoutMeetingInput> = z.object({
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
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutReviewsInputSchema),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutReviewsInputSchema),
  helpfulVotes: z.lazy(() => ReviewHelpfulCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export default ReviewCreateWithoutMeetingInputSchema;
