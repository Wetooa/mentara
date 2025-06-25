import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RoomSumOrderByAggregateInputSchema: z.ZodType<Prisma.RoomSumOrderByAggregateInput> = z.object({
  order: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RoomSumOrderByAggregateInputSchema;
