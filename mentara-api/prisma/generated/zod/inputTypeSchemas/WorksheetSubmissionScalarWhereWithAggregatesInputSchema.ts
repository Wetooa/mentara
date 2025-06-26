import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { IntNullableWithAggregatesFilterSchema } from './IntNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const WorksheetSubmissionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WorksheetSubmissionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  fileType: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default WorksheetSubmissionScalarWhereWithAggregatesInputSchema;
