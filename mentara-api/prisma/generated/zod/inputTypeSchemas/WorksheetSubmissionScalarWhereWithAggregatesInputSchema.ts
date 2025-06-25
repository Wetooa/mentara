import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const WorksheetSubmissionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WorksheetSubmissionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default WorksheetSubmissionScalarWhereWithAggregatesInputSchema;
