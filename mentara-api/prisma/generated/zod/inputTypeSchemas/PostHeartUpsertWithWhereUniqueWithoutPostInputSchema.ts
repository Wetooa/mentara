import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartUpdateWithoutPostInputSchema } from './PostHeartUpdateWithoutPostInputSchema';
import { PostHeartUncheckedUpdateWithoutPostInputSchema } from './PostHeartUncheckedUpdateWithoutPostInputSchema';
import { PostHeartCreateWithoutPostInputSchema } from './PostHeartCreateWithoutPostInputSchema';
import { PostHeartUncheckedCreateWithoutPostInputSchema } from './PostHeartUncheckedCreateWithoutPostInputSchema';

export const PostHeartUpsertWithWhereUniqueWithoutPostInputSchema: z.ZodType<Prisma.PostHeartUpsertWithWhereUniqueWithoutPostInput> = z.object({
  where: z.lazy(() => PostHeartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PostHeartUpdateWithoutPostInputSchema),z.lazy(() => PostHeartUncheckedUpdateWithoutPostInputSchema) ]),
  create: z.union([ z.lazy(() => PostHeartCreateWithoutPostInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutPostInputSchema) ]),
}).strict();

export default PostHeartUpsertWithWhereUniqueWithoutPostInputSchema;
