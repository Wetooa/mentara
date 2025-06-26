import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RoomGroupSumOrderByAggregateInputSchema: z.ZodType<Prisma.RoomGroupSumOrderByAggregateInput> = z.object({
  order: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RoomGroupSumOrderByAggregateInputSchema;
