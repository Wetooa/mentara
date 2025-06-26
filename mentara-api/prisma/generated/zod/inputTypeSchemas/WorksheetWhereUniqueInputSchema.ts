import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { WorksheetMaterialListRelationFilterSchema } from './WorksheetMaterialListRelationFilterSchema';
import { WorksheetSubmissionListRelationFilterSchema } from './WorksheetSubmissionListRelationFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { TherapistNullableScalarRelationFilterSchema } from './TherapistNullableScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const WorksheetWhereUniqueInputSchema: z.ZodType<Prisma.WorksheetWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => WorksheetWhereInputSchema),z.lazy(() => WorksheetWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetWhereInputSchema),z.lazy(() => WorksheetWhereInputSchema).array() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instructions: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  dueDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isCompleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  submittedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  feedback: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  materials: z.lazy(() => WorksheetMaterialListRelationFilterSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionListRelationFilterSchema).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistNullableScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional().nullable(),
}).strict());

export default WorksheetWhereUniqueInputSchema;
