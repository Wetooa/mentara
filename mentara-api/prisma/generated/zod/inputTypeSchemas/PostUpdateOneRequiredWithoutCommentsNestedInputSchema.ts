import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutCommentsInputSchema } from './PostCreateWithoutCommentsInputSchema';
import { PostUncheckedCreateWithoutCommentsInputSchema } from './PostUncheckedCreateWithoutCommentsInputSchema';
import { PostCreateOrConnectWithoutCommentsInputSchema } from './PostCreateOrConnectWithoutCommentsInputSchema';
import { PostUpsertWithoutCommentsInputSchema } from './PostUpsertWithoutCommentsInputSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateToOneWithWhereWithoutCommentsInputSchema } from './PostUpdateToOneWithWhereWithoutCommentsInputSchema';
import { PostUpdateWithoutCommentsInputSchema } from './PostUpdateWithoutCommentsInputSchema';
import { PostUncheckedUpdateWithoutCommentsInputSchema } from './PostUncheckedUpdateWithoutCommentsInputSchema';

export const PostUpdateOneRequiredWithoutCommentsNestedInputSchema: z.ZodType<Prisma.PostUpdateOneRequiredWithoutCommentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PostCreateOrConnectWithoutCommentsInputSchema).optional(),
  upsert: z.lazy(() => PostUpsertWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => PostWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PostUpdateToOneWithWhereWithoutCommentsInputSchema),z.lazy(() => PostUpdateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedUpdateWithoutCommentsInputSchema) ]).optional(),
}).strict();

export default PostUpdateOneRequiredWithoutCommentsNestedInputSchema;
