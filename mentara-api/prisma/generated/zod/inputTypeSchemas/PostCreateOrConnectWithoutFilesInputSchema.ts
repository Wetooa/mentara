import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostCreateWithoutFilesInputSchema } from './PostCreateWithoutFilesInputSchema';
import { PostUncheckedCreateWithoutFilesInputSchema } from './PostUncheckedCreateWithoutFilesInputSchema';

export const PostCreateOrConnectWithoutFilesInputSchema: z.ZodType<Prisma.PostCreateOrConnectWithoutFilesInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostCreateWithoutFilesInputSchema),z.lazy(() => PostUncheckedCreateWithoutFilesInputSchema) ]),
}).strict();

export default PostCreateOrConnectWithoutFilesInputSchema;
