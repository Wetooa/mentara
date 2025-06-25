import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutCommentsInputSchema } from './PostCreateWithoutCommentsInputSchema';
import { PostUncheckedCreateWithoutCommentsInputSchema } from './PostUncheckedCreateWithoutCommentsInputSchema';
import { PostCreateOrConnectWithoutCommentsInputSchema } from './PostCreateOrConnectWithoutCommentsInputSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';

export const PostCreateNestedOneWithoutCommentsInputSchema: z.ZodType<Prisma.PostCreateNestedOneWithoutCommentsInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PostCreateOrConnectWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => PostWhereUniqueInputSchema).optional()
}).strict();

export default PostCreateNestedOneWithoutCommentsInputSchema;
