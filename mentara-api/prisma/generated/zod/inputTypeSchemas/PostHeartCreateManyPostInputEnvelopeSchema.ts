import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartCreateManyPostInputSchema } from './PostHeartCreateManyPostInputSchema';

export const PostHeartCreateManyPostInputEnvelopeSchema: z.ZodType<Prisma.PostHeartCreateManyPostInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PostHeartCreateManyPostInputSchema),z.lazy(() => PostHeartCreateManyPostInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PostHeartCreateManyPostInputEnvelopeSchema;
