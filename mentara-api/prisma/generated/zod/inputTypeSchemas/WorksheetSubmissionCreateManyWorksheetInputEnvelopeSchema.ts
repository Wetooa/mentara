import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateManyWorksheetInputSchema } from './WorksheetSubmissionCreateManyWorksheetInputSchema';

export const WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyWorksheetInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WorksheetSubmissionCreateManyWorksheetInputSchema),z.lazy(() => WorksheetSubmissionCreateManyWorksheetInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema;
