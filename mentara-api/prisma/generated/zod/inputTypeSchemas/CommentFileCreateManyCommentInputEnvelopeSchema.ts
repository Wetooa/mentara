import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileCreateManyCommentInputSchema } from './CommentFileCreateManyCommentInputSchema';

export const CommentFileCreateManyCommentInputEnvelopeSchema: z.ZodType<Prisma.CommentFileCreateManyCommentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentFileCreateManyCommentInputSchema),z.lazy(() => CommentFileCreateManyCommentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CommentFileCreateManyCommentInputEnvelopeSchema;
