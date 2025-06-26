import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MeetingNotesCountOrderByAggregateInputSchema } from './MeetingNotesCountOrderByAggregateInputSchema';
import { MeetingNotesMaxOrderByAggregateInputSchema } from './MeetingNotesMaxOrderByAggregateInputSchema';
import { MeetingNotesMinOrderByAggregateInputSchema } from './MeetingNotesMinOrderByAggregateInputSchema';

export const MeetingNotesOrderByWithAggregationInputSchema: z.ZodType<Prisma.MeetingNotesOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  meetingId: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MeetingNotesCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MeetingNotesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MeetingNotesMinOrderByAggregateInputSchema).optional()
}).strict();

export default MeetingNotesOrderByWithAggregationInputSchema;
