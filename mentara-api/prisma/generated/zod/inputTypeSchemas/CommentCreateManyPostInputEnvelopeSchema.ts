import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateManyPostInputSchema } from './CommentCreateManyPostInputSchema';

export const CommentCreateManyPostInputEnvelopeSchema: z.ZodType<Prisma.CommentCreateManyPostInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentCreateManyPostInputSchema),z.lazy(() => CommentCreateManyPostInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CommentCreateManyPostInputEnvelopeSchema;
