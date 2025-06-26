import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema } from './ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema';

export const ReviewUncheckedCreateWithoutClientInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  rating: z.number().int(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  isAnonymous: z.boolean().optional(),
  therapistId: z.string(),
  meetingId: z.string().optional().nullable(),
  status: z.lazy(() => ReviewStatusSchema).optional(),
  moderatedBy: z.string().optional().nullable(),
  moderatedAt: z.coerce.date().optional().nullable(),
  moderationNote: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  helpfulCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  helpfulVotes: z.lazy(() => ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export default ReviewUncheckedCreateWithoutClientInputSchema;
