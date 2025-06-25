import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileWhereUniqueInputSchema } from './PostFileWhereUniqueInputSchema';
import { PostFileCreateWithoutPostInputSchema } from './PostFileCreateWithoutPostInputSchema';
import { PostFileUncheckedCreateWithoutPostInputSchema } from './PostFileUncheckedCreateWithoutPostInputSchema';

export const PostFileCreateOrConnectWithoutPostInputSchema: z.ZodType<Prisma.PostFileCreateOrConnectWithoutPostInput> = z.object({
  where: z.lazy(() => PostFileWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostFileCreateWithoutPostInputSchema),z.lazy(() => PostFileUncheckedCreateWithoutPostInputSchema) ]),
}).strict();

export default PostFileCreateOrConnectWithoutPostInputSchema;
