import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateManyClientInputSchema } from './WorksheetCreateManyClientInputSchema';

export const WorksheetCreateManyClientInputEnvelopeSchema: z.ZodType<Prisma.WorksheetCreateManyClientInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WorksheetCreateManyClientInputSchema),z.lazy(() => WorksheetCreateManyClientInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default WorksheetCreateManyClientInputEnvelopeSchema;
