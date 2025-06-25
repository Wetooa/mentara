import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartCreateManyReplyInputSchema } from './ReplyHeartCreateManyReplyInputSchema';

export const ReplyHeartCreateManyReplyInputEnvelopeSchema: z.ZodType<Prisma.ReplyHeartCreateManyReplyInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReplyHeartCreateManyReplyInputSchema),z.lazy(() => ReplyHeartCreateManyReplyInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReplyHeartCreateManyReplyInputEnvelopeSchema;
