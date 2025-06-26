import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateManyUserInputSchema } from './ReplyCreateManyUserInputSchema';

export const ReplyCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReplyCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReplyCreateManyUserInputSchema),z.lazy(() => ReplyCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReplyCreateManyUserInputEnvelopeSchema;
