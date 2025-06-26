import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const WorksheetScalarWhereInputSchema: z.ZodType<Prisma.WorksheetScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetScalarWhereInputSchema),z.lazy(() => WorksheetScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetScalarWhereInputSchema),z.lazy(() => WorksheetScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
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
}).strict();

export default WorksheetScalarWhereInputSchema;
