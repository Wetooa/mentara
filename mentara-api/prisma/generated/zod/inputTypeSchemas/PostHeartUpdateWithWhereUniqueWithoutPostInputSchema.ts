import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartUpdateWithoutPostInputSchema } from './PostHeartUpdateWithoutPostInputSchema';
import { PostHeartUncheckedUpdateWithoutPostInputSchema } from './PostHeartUncheckedUpdateWithoutPostInputSchema';

export const PostHeartUpdateWithWhereUniqueWithoutPostInputSchema: z.ZodType<Prisma.PostHeartUpdateWithWhereUniqueWithoutPostInput> = z.object({
  where: z.lazy(() => PostHeartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PostHeartUpdateWithoutPostInputSchema),z.lazy(() => PostHeartUncheckedUpdateWithoutPostInputSchema) ]),
}).strict();

export default PostHeartUpdateWithWhereUniqueWithoutPostInputSchema;
