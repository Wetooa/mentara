import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema } from './ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema';

export const ReviewHelpfulUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReviewHelpfulUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  review: z.lazy(() => ReviewUpdateOneRequiredWithoutHelpfulVotesNestedInputSchema).optional()
}).strict();

export default ReviewHelpfulUpdateWithoutUserInputSchema;
