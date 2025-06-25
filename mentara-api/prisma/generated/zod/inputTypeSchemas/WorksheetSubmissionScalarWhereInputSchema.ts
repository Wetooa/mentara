import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const WorksheetSubmissionScalarWhereInputSchema: z.ZodType<Prisma.WorksheetSubmissionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default WorksheetSubmissionScalarWhereInputSchema;
