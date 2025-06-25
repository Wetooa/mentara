import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { WorksheetScalarRelationFilterSchema } from './WorksheetScalarRelationFilterSchema';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const WorksheetSubmissionWhereInputSchema: z.ZodType<Prisma.WorksheetSubmissionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetSubmissionWhereInputSchema),z.lazy(() => WorksheetSubmissionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetSubmissionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetSubmissionWhereInputSchema),z.lazy(() => WorksheetSubmissionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  worksheet: z.union([ z.lazy(() => WorksheetScalarRelationFilterSchema),z.lazy(() => WorksheetWhereInputSchema) ]).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict();

export default WorksheetSubmissionWhereInputSchema;
