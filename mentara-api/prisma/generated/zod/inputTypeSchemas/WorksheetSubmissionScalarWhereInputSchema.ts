import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const WorksheetSubmissionScalarWhereInputSchema: z.ZodType<Prisma.WorksheetSubmissionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  fileType: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default WorksheetSubmissionScalarWhereInputSchema;
