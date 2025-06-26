import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RoomGroupOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RoomGroupOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RoomGroupOrderByRelationAggregateInputSchema;
