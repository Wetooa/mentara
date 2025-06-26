import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistFilesMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistFilesMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistFilesMaxOrderByAggregateInputSchema;
