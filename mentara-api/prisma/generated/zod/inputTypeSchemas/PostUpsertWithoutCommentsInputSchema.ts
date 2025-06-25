import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostUpdateWithoutCommentsInputSchema } from './PostUpdateWithoutCommentsInputSchema';
import { PostUncheckedUpdateWithoutCommentsInputSchema } from './PostUncheckedUpdateWithoutCommentsInputSchema';
import { PostCreateWithoutCommentsInputSchema } from './PostCreateWithoutCommentsInputSchema';
import { PostUncheckedCreateWithoutCommentsInputSchema } from './PostUncheckedCreateWithoutCommentsInputSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostUpsertWithoutCommentsInputSchema: z.ZodType<Prisma.PostUpsertWithoutCommentsInput> = z.object({
  update: z.union([ z.lazy(() => PostUpdateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedUpdateWithoutCommentsInputSchema) ]),
  create: z.union([ z.lazy(() => PostCreateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedCreateWithoutCommentsInputSchema) ]),
  where: z.lazy(() => PostWhereInputSchema).optional()
}).strict();

export default PostUpsertWithoutCommentsInputSchema;
