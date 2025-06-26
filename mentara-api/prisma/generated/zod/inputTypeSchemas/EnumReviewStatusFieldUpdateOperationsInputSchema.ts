import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewStatusSchema } from './ReviewStatusSchema';

export const EnumReviewStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReviewStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ReviewStatusSchema).optional()
}).strict();

export default EnumReviewStatusFieldUpdateOperationsInputSchema;
