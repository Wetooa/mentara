import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartCreateWithoutPostInputSchema } from './PostHeartCreateWithoutPostInputSchema';
import { PostHeartUncheckedCreateWithoutPostInputSchema } from './PostHeartUncheckedCreateWithoutPostInputSchema';

export const PostHeartCreateOrConnectWithoutPostInputSchema: z.ZodType<Prisma.PostHeartCreateOrConnectWithoutPostInput> = z.object({
  where: z.lazy(() => PostHeartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostHeartCreateWithoutPostInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutPostInputSchema) ]),
}).strict();

export default PostHeartCreateOrConnectWithoutPostInputSchema;
