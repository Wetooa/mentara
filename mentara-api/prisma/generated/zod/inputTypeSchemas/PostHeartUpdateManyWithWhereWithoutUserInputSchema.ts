import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartScalarWhereInputSchema } from './PostHeartScalarWhereInputSchema';
import { PostHeartUpdateManyMutationInputSchema } from './PostHeartUpdateManyMutationInputSchema';
import { PostHeartUncheckedUpdateManyWithoutUserInputSchema } from './PostHeartUncheckedUpdateManyWithoutUserInputSchema';

export const PostHeartUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PostHeartUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PostHeartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PostHeartUpdateManyMutationInputSchema),z.lazy(() => PostHeartUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default PostHeartUpdateManyWithWhereWithoutUserInputSchema;
