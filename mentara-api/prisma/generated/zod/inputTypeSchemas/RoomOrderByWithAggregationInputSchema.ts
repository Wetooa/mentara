import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { RoomCountOrderByAggregateInputSchema } from './RoomCountOrderByAggregateInputSchema';
import { RoomAvgOrderByAggregateInputSchema } from './RoomAvgOrderByAggregateInputSchema';
import { RoomMaxOrderByAggregateInputSchema } from './RoomMaxOrderByAggregateInputSchema';
import { RoomMinOrderByAggregateInputSchema } from './RoomMinOrderByAggregateInputSchema';
import { RoomSumOrderByAggregateInputSchema } from './RoomSumOrderByAggregateInputSchema';

export const RoomOrderByWithAggregationInputSchema: z.ZodType<Prisma.RoomOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => SortOrderSchema).optional(),
  roomGroupId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RoomCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => RoomAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RoomMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RoomMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => RoomSumOrderByAggregateInputSchema).optional()
}).strict();

export default RoomOrderByWithAggregationInputSchema;
