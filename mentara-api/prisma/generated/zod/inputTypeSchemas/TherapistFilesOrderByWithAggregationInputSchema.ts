import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { TherapistFilesCountOrderByAggregateInputSchema } from './TherapistFilesCountOrderByAggregateInputSchema';
import { TherapistFilesMaxOrderByAggregateInputSchema } from './TherapistFilesMaxOrderByAggregateInputSchema';
import { TherapistFilesMinOrderByAggregateInputSchema } from './TherapistFilesMinOrderByAggregateInputSchema';

export const TherapistFilesOrderByWithAggregationInputSchema: z.ZodType<Prisma.TherapistFilesOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TherapistFilesCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TherapistFilesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TherapistFilesMinOrderByAggregateInputSchema).optional()
}).strict();

export default TherapistFilesOrderByWithAggregationInputSchema;
