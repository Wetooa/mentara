import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereInputSchema } from './PostWhereInputSchema';
import { PostUpdateWithoutFilesInputSchema } from './PostUpdateWithoutFilesInputSchema';
import { PostUncheckedUpdateWithoutFilesInputSchema } from './PostUncheckedUpdateWithoutFilesInputSchema';

export const PostUpdateToOneWithWhereWithoutFilesInputSchema: z.ZodType<Prisma.PostUpdateToOneWithWhereWithoutFilesInput> = z.object({
  where: z.lazy(() => PostWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PostUpdateWithoutFilesInputSchema),z.lazy(() => PostUncheckedUpdateWithoutFilesInputSchema) ]),
}).strict();

export default PostUpdateToOneWithWhereWithoutFilesInputSchema;
