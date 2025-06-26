import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { MeetingCountOrderByAggregateInputSchema } from './MeetingCountOrderByAggregateInputSchema';
import { MeetingAvgOrderByAggregateInputSchema } from './MeetingAvgOrderByAggregateInputSchema';
import { MeetingMaxOrderByAggregateInputSchema } from './MeetingMaxOrderByAggregateInputSchema';
import { MeetingMinOrderByAggregateInputSchema } from './MeetingMinOrderByAggregateInputSchema';
import { MeetingSumOrderByAggregateInputSchema } from './MeetingSumOrderByAggregateInputSchema';

export const MeetingOrderByWithAggregationInputSchema: z.ZodType<Prisma.MeetingOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  startTime: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  meetingType: z.lazy(() => SortOrderSchema).optional(),
  meetingUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MeetingCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => MeetingAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MeetingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MeetingMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => MeetingSumOrderByAggregateInputSchema).optional()
}).strict();

export default MeetingOrderByWithAggregationInputSchema;
