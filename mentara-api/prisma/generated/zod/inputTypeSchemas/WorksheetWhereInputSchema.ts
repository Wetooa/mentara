import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { WorksheetMaterialListRelationFilterSchema } from './WorksheetMaterialListRelationFilterSchema';
import { WorksheetSubmissionListRelationFilterSchema } from './WorksheetSubmissionListRelationFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { TherapistNullableScalarRelationFilterSchema } from './TherapistNullableScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const WorksheetWhereInputSchema: z.ZodType<Prisma.WorksheetWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetWhereInputSchema),z.lazy(() => WorksheetWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetWhereInputSchema),z.lazy(() => WorksheetWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  materials: z.lazy(() => WorksheetMaterialListRelationFilterSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionListRelationFilterSchema).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistNullableScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional().nullable(),
}).strict();

export default WorksheetWhereInputSchema;
