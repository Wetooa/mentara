import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostCreateWithoutUserInputSchema } from './PostCreateWithoutUserInputSchema';
import { PostUncheckedCreateWithoutUserInputSchema } from './PostUncheckedCreateWithoutUserInputSchema';

export const PostCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PostCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostCreateWithoutUserInputSchema),z.lazy(() => PostUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default PostCreateOrConnectWithoutUserInputSchema;
