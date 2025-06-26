import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateNestedOneWithoutSubmissionsInputSchema } from './WorksheetCreateNestedOneWithoutSubmissionsInputSchema';

export const WorksheetSubmissionCreateWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  worksheet: z.lazy(() => WorksheetCreateNestedOneWithoutSubmissionsInputSchema)
}).strict();

export default WorksheetSubmissionCreateWithoutClientInputSchema;
