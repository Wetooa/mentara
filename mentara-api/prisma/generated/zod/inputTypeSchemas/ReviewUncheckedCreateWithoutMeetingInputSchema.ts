import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema } from './ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema';

export const ReviewUncheckedCreateWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutMeetingInput> = z.object({
  id: z.string().uuid().optional(),
  rating: z.number().int(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  isAnonymous: z.boolean().optional(),
  clientId: z.string(),
  therapistId: z.string(),
  status: z.lazy(() => ReviewStatusSchema).optional(),
  moderatedBy: z.string().optional().nullable(),
  moderatedAt: z.coerce.date().optional().nullable(),
  moderationNote: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  helpfulVotes: z.lazy(() => ReviewHelpfulUncheckedCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export default ReviewUncheckedCreateWithoutMeetingInputSchema;
