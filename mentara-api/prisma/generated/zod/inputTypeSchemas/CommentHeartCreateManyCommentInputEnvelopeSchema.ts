import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCreateManyCommentInputSchema } from './CommentHeartCreateManyCommentInputSchema';

export const CommentHeartCreateManyCommentInputEnvelopeSchema: z.ZodType<Prisma.CommentHeartCreateManyCommentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentHeartCreateManyCommentInputSchema),z.lazy(() => CommentHeartCreateManyCommentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CommentHeartCreateManyCommentInputEnvelopeSchema;
