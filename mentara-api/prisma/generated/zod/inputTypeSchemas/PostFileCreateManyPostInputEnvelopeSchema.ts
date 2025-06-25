import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileCreateManyPostInputSchema } from './PostFileCreateManyPostInputSchema';

export const PostFileCreateManyPostInputEnvelopeSchema: z.ZodType<Prisma.PostFileCreateManyPostInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PostFileCreateManyPostInputSchema),z.lazy(() => PostFileCreateManyPostInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PostFileCreateManyPostInputEnvelopeSchema;
