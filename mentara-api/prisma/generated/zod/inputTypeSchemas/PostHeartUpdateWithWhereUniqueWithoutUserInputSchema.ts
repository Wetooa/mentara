import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartUpdateWithoutUserInputSchema } from './PostHeartUpdateWithoutUserInputSchema';
import { PostHeartUncheckedUpdateWithoutUserInputSchema } from './PostHeartUncheckedUpdateWithoutUserInputSchema';

export const PostHeartUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PostHeartUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PostHeartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PostHeartUpdateWithoutUserInputSchema),z.lazy(() => PostHeartUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default PostHeartUpdateWithWhereUniqueWithoutUserInputSchema;
