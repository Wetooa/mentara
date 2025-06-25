import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutFilesInputSchema } from './PostCreateWithoutFilesInputSchema';
import { PostUncheckedCreateWithoutFilesInputSchema } from './PostUncheckedCreateWithoutFilesInputSchema';
import { PostCreateOrConnectWithoutFilesInputSchema } from './PostCreateOrConnectWithoutFilesInputSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';

export const PostCreateNestedOneWithoutFilesInputSchema: z.ZodType<Prisma.PostCreateNestedOneWithoutFilesInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutFilesInputSchema),z.lazy(() => PostUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PostCreateOrConnectWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => PostWhereUniqueInputSchema).optional()
}).strict();

export default PostCreateNestedOneWithoutFilesInputSchema;
