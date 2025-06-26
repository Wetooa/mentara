import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RoomGroupAvgOrderByAggregateInputSchema: z.ZodType<Prisma.RoomGroupAvgOrderByAggregateInput> = z.object({
  order: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RoomGroupAvgOrderByAggregateInputSchema;
