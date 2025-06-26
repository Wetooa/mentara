import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostCreateWithoutCommentsInputSchema } from './PostCreateWithoutCommentsInputSchema';
import { PostUncheckedCreateWithoutCommentsInputSchema } from './PostUncheckedCreateWithoutCommentsInputSchema';

export const PostCreateOrConnectWithoutCommentsInputSchema: z.ZodType<Prisma.PostCreateOrConnectWithoutCommentsInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostCreateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedCreateWithoutCommentsInputSchema) ]),
}).strict();

export default PostCreateOrConnectWithoutCommentsInputSchema;
