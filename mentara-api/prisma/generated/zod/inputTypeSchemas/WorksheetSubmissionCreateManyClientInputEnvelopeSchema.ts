import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateManyClientInputSchema } from './WorksheetSubmissionCreateManyClientInputSchema';

export const WorksheetSubmissionCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.WorksheetSubmissionCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WorksheetSubmissionCreateManyClientInputSchema),z.lazy(() => WorksheetSubmissionCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default WorksheetSubmissionCreateManyClientInputEnvelopeSchema;
