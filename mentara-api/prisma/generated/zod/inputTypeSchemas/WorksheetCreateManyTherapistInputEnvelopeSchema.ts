import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateManyTherapistInputSchema } from './WorksheetCreateManyTherapistInputSchema';

export const WorksheetCreateManyTherapistInputEnvelopeSchema: z.ZodType<Prisma.WorksheetCreateManyTherapistInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WorksheetCreateManyTherapistInputSchema),z.lazy(() => WorksheetCreateManyTherapistInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default WorksheetCreateManyTherapistInputEnvelopeSchema;
