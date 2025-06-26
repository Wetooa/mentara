import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartCreateManyUserInputSchema } from './PostHeartCreateManyUserInputSchema';

export const PostHeartCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PostHeartCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PostHeartCreateManyUserInputSchema),z.lazy(() => PostHeartCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PostHeartCreateManyUserInputEnvelopeSchema;
