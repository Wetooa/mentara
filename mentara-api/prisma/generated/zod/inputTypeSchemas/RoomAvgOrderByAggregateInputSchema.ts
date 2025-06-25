import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RoomAvgOrderByAggregateInputSchema: z.ZodType<Prisma.RoomAvgOrderByAggregateInput> = z.object({
  order: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RoomAvgOrderByAggregateInputSchema;
