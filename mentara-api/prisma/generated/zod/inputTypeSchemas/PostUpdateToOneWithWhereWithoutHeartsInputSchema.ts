import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereInputSchema } from './PostWhereInputSchema';
import { PostUpdateWithoutHeartsInputSchema } from './PostUpdateWithoutHeartsInputSchema';
import { PostUncheckedUpdateWithoutHeartsInputSchema } from './PostUncheckedUpdateWithoutHeartsInputSchema';

export const PostUpdateToOneWithWhereWithoutHeartsInputSchema: z.ZodType<Prisma.PostUpdateToOneWithWhereWithoutHeartsInput> = z.object({
  where: z.lazy(() => PostWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PostUpdateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedUpdateWithoutHeartsInputSchema) ]),
}).strict();

export default PostUpdateToOneWithWhereWithoutHeartsInputSchema;
