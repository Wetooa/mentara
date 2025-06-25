import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RoomGroupCountOrderByAggregateInputSchema: z.ZodType<Prisma.RoomGroupCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => SortOrderSchema).optional(),
  communityId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RoomGroupCountOrderByAggregateInputSchema;
