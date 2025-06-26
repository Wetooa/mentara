import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const ReviewCountOutputTypeSelectSchema: z.ZodType<Prisma.ReviewCountOutputTypeSelect> = z.object({
  helpfulVotes: z.boolean().optional(),
}).strict();

export default ReviewCountOutputTypeSelectSchema;
