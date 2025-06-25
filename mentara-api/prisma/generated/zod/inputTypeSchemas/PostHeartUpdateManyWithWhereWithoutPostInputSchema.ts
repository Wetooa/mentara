import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartScalarWhereInputSchema } from './PostHeartScalarWhereInputSchema';
import { PostHeartUpdateManyMutationInputSchema } from './PostHeartUpdateManyMutationInputSchema';
import { PostHeartUncheckedUpdateManyWithoutPostInputSchema } from './PostHeartUncheckedUpdateManyWithoutPostInputSchema';

export const PostHeartUpdateManyWithWhereWithoutPostInputSchema: z.ZodType<Prisma.PostHeartUpdateManyWithWhereWithoutPostInput> = z.object({
  where: z.lazy(() => PostHeartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PostHeartUpdateManyMutationInputSchema),z.lazy(() => PostHeartUncheckedUpdateManyWithoutPostInputSchema) ]),
}).strict();

export default PostHeartUpdateManyWithWhereWithoutPostInputSchema;
