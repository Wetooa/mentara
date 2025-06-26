import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema } from './UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema';

export const ReviewHelpfulUpdateWithoutReviewInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateWithoutReviewInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsHelpfulNestedInputSchema).optional()
}).strict();

export default ReviewHelpfulUpdateWithoutReviewInputSchema;
