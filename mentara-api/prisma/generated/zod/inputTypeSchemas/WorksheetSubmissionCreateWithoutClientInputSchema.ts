import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateNestedOneWithoutSubmissionsInputSchema } from './WorksheetCreateNestedOneWithoutSubmissionsInputSchema';

export const WorksheetSubmissionCreateWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  worksheet: z.lazy(() => WorksheetCreateNestedOneWithoutSubmissionsInputSchema)
}).strict();

export default WorksheetSubmissionCreateWithoutClientInputSchema;
