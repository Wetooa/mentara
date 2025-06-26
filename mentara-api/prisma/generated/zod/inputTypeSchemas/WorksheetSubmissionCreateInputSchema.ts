import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateNestedOneWithoutSubmissionsInputSchema } from './WorksheetCreateNestedOneWithoutSubmissionsInputSchema';
import { ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema } from './ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema';

export const WorksheetSubmissionCreateInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateInput> = z.object({
  id: z.string().uuid().optional(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  worksheet: z.lazy(() => WorksheetCreateNestedOneWithoutSubmissionsInputSchema),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema)
}).strict();

export default WorksheetSubmissionCreateInputSchema;
