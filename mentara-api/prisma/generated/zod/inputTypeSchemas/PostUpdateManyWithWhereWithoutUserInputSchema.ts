import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostScalarWhereInputSchema } from './PostScalarWhereInputSchema';
import { PostUpdateManyMutationInputSchema } from './PostUpdateManyMutationInputSchema';
import { PostUncheckedUpdateManyWithoutUserInputSchema } from './PostUncheckedUpdateManyWithoutUserInputSchema';

export const PostUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PostUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PostScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PostUpdateManyMutationInputSchema),z.lazy(() => PostUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default PostUpdateManyWithWhereWithoutUserInputSchema;
