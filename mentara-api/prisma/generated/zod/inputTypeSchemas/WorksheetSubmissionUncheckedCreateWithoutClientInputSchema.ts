import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetSubmissionUncheckedCreateWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionUncheckedCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  worksheetId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetSubmissionUncheckedCreateWithoutClientInputSchema;
