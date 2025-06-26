import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ReviewHelpfulIncludeSchema: z.ZodType<Prisma.ReviewHelpfulInclude> = z.object({
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ReviewHelpfulIncludeSchema;
