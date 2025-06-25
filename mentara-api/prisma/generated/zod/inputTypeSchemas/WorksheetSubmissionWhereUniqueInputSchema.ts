import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereInputSchema } from './WorksheetSubmissionWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { WorksheetScalarRelationFilterSchema } from './WorksheetScalarRelationFilterSchema';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const WorksheetSubmissionWhereUniqueInputSchema: z.ZodType<Prisma.WorksheetSubmissionWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => WorksheetSubmissionWhereInputSchema),z.lazy(() => WorksheetSubmissionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetSubmissionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetSubmissionWhereInputSchema),z.lazy(() => WorksheetSubmissionWhereInputSchema).array() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  worksheet: z.union([ z.lazy(() => WorksheetScalarRelationFilterSchema),z.lazy(() => WorksheetWhereInputSchema) ]).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict());

export default WorksheetSubmissionWhereUniqueInputSchema;
