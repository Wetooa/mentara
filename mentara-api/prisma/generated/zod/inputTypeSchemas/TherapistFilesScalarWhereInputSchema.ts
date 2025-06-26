import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const TherapistFilesScalarWhereInputSchema: z.ZodType<Prisma.TherapistFilesScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TherapistFilesScalarWhereInputSchema),z.lazy(() => TherapistFilesScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistFilesScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistFilesScalarWhereInputSchema),z.lazy(() => TherapistFilesScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileUrl: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TherapistFilesScalarWhereInputSchema;
