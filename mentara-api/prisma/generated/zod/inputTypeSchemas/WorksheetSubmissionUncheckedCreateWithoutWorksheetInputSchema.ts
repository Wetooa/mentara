import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionUncheckedCreateWithoutWorksheetInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema;
