import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateManyParentInputSchema } from './CommentCreateManyParentInputSchema';

export const CommentCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.CommentCreateManyParentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CommentCreateManyParentInputSchema),z.lazy(() => CommentCreateManyParentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CommentCreateManyParentInputEnvelopeSchema;
