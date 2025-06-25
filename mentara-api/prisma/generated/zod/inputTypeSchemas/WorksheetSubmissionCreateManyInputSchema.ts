import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetSubmissionCreateManyInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  worksheetId: z.string(),
  clientId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetSubmissionCreateManyInputSchema;
