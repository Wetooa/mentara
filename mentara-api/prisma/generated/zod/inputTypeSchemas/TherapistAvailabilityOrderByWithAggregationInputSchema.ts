import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { TherapistAvailabilityCountOrderByAggregateInputSchema } from './TherapistAvailabilityCountOrderByAggregateInputSchema';
import { TherapistAvailabilityAvgOrderByAggregateInputSchema } from './TherapistAvailabilityAvgOrderByAggregateInputSchema';
import { TherapistAvailabilityMaxOrderByAggregateInputSchema } from './TherapistAvailabilityMaxOrderByAggregateInputSchema';
import { TherapistAvailabilityMinOrderByAggregateInputSchema } from './TherapistAvailabilityMinOrderByAggregateInputSchema';
import { TherapistAvailabilitySumOrderByAggregateInputSchema } from './TherapistAvailabilitySumOrderByAggregateInputSchema';

export const TherapistAvailabilityOrderByWithAggregationInputSchema: z.ZodType<Prisma.TherapistAvailabilityOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  dayOfWeek: z.lazy(() => SortOrderSchema).optional(),
  startTime: z.lazy(() => SortOrderSchema).optional(),
  endTime: z.lazy(() => SortOrderSchema).optional(),
  isAvailable: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TherapistAvailabilityCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TherapistAvailabilityAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TherapistAvailabilityMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TherapistAvailabilityMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TherapistAvailabilitySumOrderByAggregateInputSchema).optional()
}).strict();

export default TherapistAvailabilityOrderByWithAggregationInputSchema;
