import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartCreateWithoutUserInputSchema } from './PostHeartCreateWithoutUserInputSchema';
import { PostHeartUncheckedCreateWithoutUserInputSchema } from './PostHeartUncheckedCreateWithoutUserInputSchema';

export const PostHeartCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PostHeartCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PostHeartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostHeartCreateWithoutUserInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default PostHeartCreateOrConnectWithoutUserInputSchema;
