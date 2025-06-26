import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateManyUserInputSchema } from './CommentCreateManyUserInputSchema';

export const CommentCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CommentCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentCreateManyUserInputSchema),z.lazy(() => CommentCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CommentCreateManyUserInputEnvelopeSchema;
