import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema } from './ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema';
import { UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema } from './UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema';

export const ReviewHelpfulUpdateInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  review: z.lazy(() => ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema).optional()
}).strict();

export default ReviewHelpfulUpdateInputSchema;
