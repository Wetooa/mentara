import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileWhereUniqueInputSchema } from './PostFileWhereUniqueInputSchema';
import { PostFileUpdateWithoutPostInputSchema } from './PostFileUpdateWithoutPostInputSchema';
import { PostFileUncheckedUpdateWithoutPostInputSchema } from './PostFileUncheckedUpdateWithoutPostInputSchema';

export const PostFileUpdateWithWhereUniqueWithoutPostInputSchema: z.ZodType<Prisma.PostFileUpdateWithWhereUniqueWithoutPostInput> = z.object({
  where: z.lazy(() => PostFileWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PostFileUpdateWithoutPostInputSchema),z.lazy(() => PostFileUncheckedUpdateWithoutPostInputSchema) ]),
}).strict();

export default PostFileUpdateWithWhereUniqueWithoutPostInputSchema;
