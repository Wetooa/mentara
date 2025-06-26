import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ReviewHelpfulSelectSchema: z.ZodType<Prisma.ReviewHelpfulSelect> = z.object({
  id: z.boolean().optional(),
  reviewId: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ReviewHelpfulSelectSchema;
