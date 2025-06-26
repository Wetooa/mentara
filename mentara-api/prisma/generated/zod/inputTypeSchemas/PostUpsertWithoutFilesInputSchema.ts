import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostUpdateWithoutFilesInputSchema } from './PostUpdateWithoutFilesInputSchema';
import { PostUncheckedUpdateWithoutFilesInputSchema } from './PostUncheckedUpdateWithoutFilesInputSchema';
import { PostCreateWithoutFilesInputSchema } from './PostCreateWithoutFilesInputSchema';
import { PostUncheckedCreateWithoutFilesInputSchema } from './PostUncheckedCreateWithoutFilesInputSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostUpsertWithoutFilesInputSchema: z.ZodType<Prisma.PostUpsertWithoutFilesInput> = z.object({
  update: z.union([ z.lazy(() => PostUpdateWithoutFilesInputSchema),z.lazy(() => PostUncheckedUpdateWithoutFilesInputSchema) ]),
  create: z.union([ z.lazy(() => PostCreateWithoutFilesInputSchema),z.lazy(() => PostUncheckedCreateWithoutFilesInputSchema) ]),
  where: z.lazy(() => PostWhereInputSchema).optional()
}).strict();

export default PostUpsertWithoutFilesInputSchema;
