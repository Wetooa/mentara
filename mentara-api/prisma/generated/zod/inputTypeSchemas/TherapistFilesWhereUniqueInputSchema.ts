import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesWhereInputSchema } from './TherapistFilesWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { TherapistScalarRelationFilterSchema } from './TherapistScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistFilesWhereUniqueInputSchema: z.ZodType<Prisma.TherapistFilesWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => TherapistFilesWhereInputSchema),z.lazy(() => TherapistFilesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistFilesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistFilesWhereInputSchema),z.lazy(() => TherapistFilesWhereInputSchema).array() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileUrl: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
}).strict());

export default TherapistFilesWhereUniqueInputSchema;
