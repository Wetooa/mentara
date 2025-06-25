import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MeetingOrderByRelationAggregateInputSchema } from './MeetingOrderByRelationAggregateInputSchema';

export const MeetingDurationOrderByWithRelationInputSchema: z.ZodType<Prisma.MeetingDurationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  meetings: z.lazy(() => MeetingOrderByRelationAggregateInputSchema).optional()
}).strict();

export default MeetingDurationOrderByWithRelationInputSchema;
