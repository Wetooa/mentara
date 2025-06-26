import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetSubmissionCreateManyWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyWorksheetInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetSubmissionCreateManyWorksheetInputSchema;
