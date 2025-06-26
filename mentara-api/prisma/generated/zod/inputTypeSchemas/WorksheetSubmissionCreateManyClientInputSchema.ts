import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetSubmissionCreateManyClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyClientInput> = z.object({
  id: z.string().uuid().optional(),
  worksheetId: z.string(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetSubmissionCreateManyClientInputSchema;
