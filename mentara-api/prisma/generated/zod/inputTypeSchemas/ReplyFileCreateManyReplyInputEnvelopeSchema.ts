import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileCreateManyReplyInputSchema } from './ReplyFileCreateManyReplyInputSchema';

export const ReplyFileCreateManyReplyInputEnvelopeSchema: z.ZodType<Prisma.ReplyFileCreateManyReplyInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReplyFileCreateManyReplyInputSchema),z.lazy(() => ReplyFileCreateManyReplyInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReplyFileCreateManyReplyInputEnvelopeSchema;
