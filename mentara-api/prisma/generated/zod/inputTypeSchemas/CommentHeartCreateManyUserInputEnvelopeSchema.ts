import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCreateManyUserInputSchema } from './CommentHeartCreateManyUserInputSchema';

export const CommentHeartCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CommentHeartCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentHeartCreateManyUserInputSchema),z.lazy(() => CommentHeartCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CommentHeartCreateManyUserInputEnvelopeSchema;
