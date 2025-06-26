import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateWithoutUserInputSchema } from './PostUpdateWithoutUserInputSchema';
import { PostUncheckedUpdateWithoutUserInputSchema } from './PostUncheckedUpdateWithoutUserInputSchema';

export const PostUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PostUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PostUpdateWithoutUserInputSchema),z.lazy(() => PostUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default PostUpdateWithWhereUniqueWithoutUserInputSchema;
