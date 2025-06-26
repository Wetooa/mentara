import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema } from './ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema';

export const WorksheetSubmissionCreateWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateWithoutWorksheetInput> = z.object({
  id: z.string().uuid().optional(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema)
}).strict();

export default WorksheetSubmissionCreateWithoutWorksheetInputSchema;
