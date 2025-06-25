import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { RoomGroupCountOrderByAggregateInputSchema } from './RoomGroupCountOrderByAggregateInputSchema';
import { RoomGroupAvgOrderByAggregateInputSchema } from './RoomGroupAvgOrderByAggregateInputSchema';
import { RoomGroupMaxOrderByAggregateInputSchema } from './RoomGroupMaxOrderByAggregateInputSchema';
import { RoomGroupMinOrderByAggregateInputSchema } from './RoomGroupMinOrderByAggregateInputSchema';
import { RoomGroupSumOrderByAggregateInputSchema } from './RoomGroupSumOrderByAggregateInputSchema';

export const RoomGroupOrderByWithAggregationInputSchema: z.ZodType<Prisma.RoomGroupOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => SortOrderSchema).optional(),
  communityId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RoomGroupCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => RoomGroupAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RoomGroupMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RoomGroupMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => RoomGroupSumOrderByAggregateInputSchema).optional()
}).strict();

export default RoomGroupOrderByWithAggregationInputSchema;
