import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereInputSchema } from './WorksheetSubmissionWhereInputSchema';

export const WorksheetSubmissionListRelationFilterSchema: z.ZodType<Prisma.WorksheetSubmissionListRelationFilter> = z.object({
  every: z.lazy(() => WorksheetSubmissionWhereInputSchema).optional(),
  some: z.lazy(() => WorksheetSubmissionWhereInputSchema).optional(),
  none: z.lazy(() => WorksheetSubmissionWhereInputSchema).optional()
}).strict();

export default WorksheetSubmissionListRelationFilterSchema;
