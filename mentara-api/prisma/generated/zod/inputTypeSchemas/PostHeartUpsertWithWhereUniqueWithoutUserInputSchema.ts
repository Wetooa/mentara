import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartUpdateWithoutUserInputSchema } from './PostHeartUpdateWithoutUserInputSchema';
import { PostHeartUncheckedUpdateWithoutUserInputSchema } from './PostHeartUncheckedUpdateWithoutUserInputSchema';
import { PostHeartCreateWithoutUserInputSchema } from './PostHeartCreateWithoutUserInputSchema';
import { PostHeartUncheckedCreateWithoutUserInputSchema } from './PostHeartUncheckedCreateWithoutUserInputSchema';

export const PostHeartUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PostHeartUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PostHeartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PostHeartUpdateWithoutUserInputSchema),z.lazy(() => PostHeartUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PostHeartCreateWithoutUserInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default PostHeartUpsertWithWhereUniqueWithoutUserInputSchema;
