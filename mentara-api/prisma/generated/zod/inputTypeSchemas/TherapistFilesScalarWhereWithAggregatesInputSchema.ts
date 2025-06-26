import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const TherapistFilesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TherapistFilesScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TherapistFilesScalarWhereWithAggregatesInputSchema),z.lazy(() => TherapistFilesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistFilesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistFilesScalarWhereWithAggregatesInputSchema),z.lazy(() => TherapistFilesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fileUrl: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TherapistFilesScalarWhereWithAggregatesInputSchema;
