import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetSubmissionUncheckedCreateInputSchema: z.ZodType<Prisma.WorksheetSubmissionUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  worksheetId: z.string(),
  clientId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetSubmissionUncheckedCreateInputSchema;
