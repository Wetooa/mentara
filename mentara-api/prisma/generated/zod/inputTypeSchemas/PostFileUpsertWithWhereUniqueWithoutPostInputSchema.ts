import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileWhereUniqueInputSchema } from './PostFileWhereUniqueInputSchema';
import { PostFileUpdateWithoutPostInputSchema } from './PostFileUpdateWithoutPostInputSchema';
import { PostFileUncheckedUpdateWithoutPostInputSchema } from './PostFileUncheckedUpdateWithoutPostInputSchema';
import { PostFileCreateWithoutPostInputSchema } from './PostFileCreateWithoutPostInputSchema';
import { PostFileUncheckedCreateWithoutPostInputSchema } from './PostFileUncheckedCreateWithoutPostInputSchema';

export const PostFileUpsertWithWhereUniqueWithoutPostInputSchema: z.ZodType<Prisma.PostFileUpsertWithWhereUniqueWithoutPostInput> = z.object({
  where: z.lazy(() => PostFileWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PostFileUpdateWithoutPostInputSchema),z.lazy(() => PostFileUncheckedUpdateWithoutPostInputSchema) ]),
  create: z.union([ z.lazy(() => PostFileCreateWithoutPostInputSchema),z.lazy(() => PostFileUncheckedCreateWithoutPostInputSchema) ]),
}).strict();

export default PostFileUpsertWithWhereUniqueWithoutPostInputSchema;
