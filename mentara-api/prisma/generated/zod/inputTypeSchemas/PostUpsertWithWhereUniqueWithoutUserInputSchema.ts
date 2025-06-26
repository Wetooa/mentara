import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateWithoutUserInputSchema } from './PostUpdateWithoutUserInputSchema';
import { PostUncheckedUpdateWithoutUserInputSchema } from './PostUncheckedUpdateWithoutUserInputSchema';
import { PostCreateWithoutUserInputSchema } from './PostCreateWithoutUserInputSchema';
import { PostUncheckedCreateWithoutUserInputSchema } from './PostUncheckedCreateWithoutUserInputSchema';

export const PostUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PostUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PostUpdateWithoutUserInputSchema),z.lazy(() => PostUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PostCreateWithoutUserInputSchema),z.lazy(() => PostUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default PostUpsertWithWhereUniqueWithoutUserInputSchema;
