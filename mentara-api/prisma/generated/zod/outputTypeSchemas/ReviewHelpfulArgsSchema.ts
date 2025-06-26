import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulSelectSchema } from '../inputTypeSchemas/ReviewHelpfulSelectSchema';
import { ReviewHelpfulIncludeSchema } from '../inputTypeSchemas/ReviewHelpfulIncludeSchema';

export const ReviewHelpfulArgsSchema: z.ZodType<Prisma.ReviewHelpfulDefaultArgs> = z.object({
  select: z.lazy(() => ReviewHelpfulSelectSchema).optional(),
  include: z.lazy(() => ReviewHelpfulIncludeSchema).optional(),
}).strict();

export default ReviewHelpfulArgsSchema;
