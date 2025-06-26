import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema } from './ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema';

export const WorksheetSubmissionCreateWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateWithoutWorksheetInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetSubmissionsInputSchema)
}).strict();

export default WorksheetSubmissionCreateWithoutWorksheetInputSchema;
