import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulWhereInputSchema } from './ReviewHelpfulWhereInputSchema';

export const ReviewHelpfulListRelationFilterSchema: z.ZodType<Prisma.ReviewHelpfulListRelationFilter> = z.object({
  every: z.lazy(() => ReviewHelpfulWhereInputSchema).optional(),
  some: z.lazy(() => ReviewHelpfulWhereInputSchema).optional(),
  none: z.lazy(() => ReviewHelpfulWhereInputSchema).optional()
}).strict();

export default ReviewHelpfulListRelationFilterSchema;
