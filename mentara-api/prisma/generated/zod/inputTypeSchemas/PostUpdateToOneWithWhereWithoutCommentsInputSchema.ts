import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereInputSchema } from './PostWhereInputSchema';
import { PostUpdateWithoutCommentsInputSchema } from './PostUpdateWithoutCommentsInputSchema';
import { PostUncheckedUpdateWithoutCommentsInputSchema } from './PostUncheckedUpdateWithoutCommentsInputSchema';

export const PostUpdateToOneWithWhereWithoutCommentsInputSchema: z.ZodType<Prisma.PostUpdateToOneWithWhereWithoutCommentsInput> = z.object({
  where: z.lazy(() => PostWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PostUpdateWithoutCommentsInputSchema),z.lazy(() => PostUncheckedUpdateWithoutCommentsInputSchema) ]),
}).strict();

export default PostUpdateToOneWithWhereWithoutCommentsInputSchema;
