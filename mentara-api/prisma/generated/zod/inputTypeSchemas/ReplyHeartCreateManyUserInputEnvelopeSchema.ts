import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartCreateManyUserInputSchema } from './ReplyHeartCreateManyUserInputSchema';

export const ReplyHeartCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReplyHeartCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReplyHeartCreateManyUserInputSchema),z.lazy(() => ReplyHeartCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReplyHeartCreateManyUserInputEnvelopeSchema;
