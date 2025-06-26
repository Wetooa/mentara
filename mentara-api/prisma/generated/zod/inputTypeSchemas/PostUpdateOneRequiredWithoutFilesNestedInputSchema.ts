import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutFilesInputSchema } from './PostCreateWithoutFilesInputSchema';
import { PostUncheckedCreateWithoutFilesInputSchema } from './PostUncheckedCreateWithoutFilesInputSchema';
import { PostCreateOrConnectWithoutFilesInputSchema } from './PostCreateOrConnectWithoutFilesInputSchema';
import { PostUpsertWithoutFilesInputSchema } from './PostUpsertWithoutFilesInputSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateToOneWithWhereWithoutFilesInputSchema } from './PostUpdateToOneWithWhereWithoutFilesInputSchema';
import { PostUpdateWithoutFilesInputSchema } from './PostUpdateWithoutFilesInputSchema';
import { PostUncheckedUpdateWithoutFilesInputSchema } from './PostUncheckedUpdateWithoutFilesInputSchema';

export const PostUpdateOneRequiredWithoutFilesNestedInputSchema: z.ZodType<Prisma.PostUpdateOneRequiredWithoutFilesNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutFilesInputSchema),z.lazy(() => PostUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PostCreateOrConnectWithoutFilesInputSchema).optional(),
  upsert: z.lazy(() => PostUpsertWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => PostWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PostUpdateToOneWithWhereWithoutFilesInputSchema),z.lazy(() => PostUpdateWithoutFilesInputSchema),z.lazy(() => PostUncheckedUpdateWithoutFilesInputSchema) ]).optional(),
}).strict();

export default PostUpdateOneRequiredWithoutFilesNestedInputSchema;
