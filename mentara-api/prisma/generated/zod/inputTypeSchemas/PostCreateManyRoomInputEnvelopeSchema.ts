import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateManyRoomInputSchema } from './PostCreateManyRoomInputSchema';

export const PostCreateManyRoomInputEnvelopeSchema: z.ZodType<Prisma.PostCreateManyRoomInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PostCreateManyRoomInputSchema),z.lazy(() => PostCreateManyRoomInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PostCreateManyRoomInputEnvelopeSchema;
