import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateManyCommentInputSchema } from './ReplyCreateManyCommentInputSchema';

export const ReplyCreateManyCommentInputEnvelopeSchema: z.ZodType<Prisma.ReplyCreateManyCommentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReplyCreateManyCommentInputSchema),z.lazy(() => ReplyCreateManyCommentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReplyCreateManyCommentInputEnvelopeSchema;
