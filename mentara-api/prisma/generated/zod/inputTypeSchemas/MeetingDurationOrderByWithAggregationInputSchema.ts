import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MeetingDurationCountOrderByAggregateInputSchema } from './MeetingDurationCountOrderByAggregateInputSchema';
import { MeetingDurationAvgOrderByAggregateInputSchema } from './MeetingDurationAvgOrderByAggregateInputSchema';
import { MeetingDurationMaxOrderByAggregateInputSchema } from './MeetingDurationMaxOrderByAggregateInputSchema';
import { MeetingDurationMinOrderByAggregateInputSchema } from './MeetingDurationMinOrderByAggregateInputSchema';
import { MeetingDurationSumOrderByAggregateInputSchema } from './MeetingDurationSumOrderByAggregateInputSchema';

export const MeetingDurationOrderByWithAggregationInputSchema: z.ZodType<Prisma.MeetingDurationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MeetingDurationCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => MeetingDurationAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MeetingDurationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MeetingDurationMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => MeetingDurationSumOrderByAggregateInputSchema).optional()
}).strict();

export default MeetingDurationOrderByWithAggregationInputSchema;
