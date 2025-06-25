import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateNestedOneWithoutSubmissionsInputSchema } from './WorksheetCreateNestedOneWithoutSubmissionsInputSchema';
import { ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema } from './ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema';

export const WorksheetSubmissionCreateInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  worksheet: z.lazy(() => WorksheetCreateNestedOneWithoutSubmissionsInputSchema),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema)
}).strict();

export default WorksheetSubmissionCreateInputSchema;
