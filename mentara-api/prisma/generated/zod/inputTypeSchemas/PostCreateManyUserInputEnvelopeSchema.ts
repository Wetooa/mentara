import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateManyUserInputSchema } from './PostCreateManyUserInputSchema';

export const PostCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PostCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PostCreateManyUserInputSchema),z.lazy(() => PostCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PostCreateManyUserInputEnvelopeSchema;
