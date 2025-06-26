import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostUpdateWithoutHeartsInputSchema } from './PostUpdateWithoutHeartsInputSchema';
import { PostUncheckedUpdateWithoutHeartsInputSchema } from './PostUncheckedUpdateWithoutHeartsInputSchema';
import { PostCreateWithoutHeartsInputSchema } from './PostCreateWithoutHeartsInputSchema';
import { PostUncheckedCreateWithoutHeartsInputSchema } from './PostUncheckedCreateWithoutHeartsInputSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostUpsertWithoutHeartsInputSchema: z.ZodType<Prisma.PostUpsertWithoutHeartsInput> = z.object({
  update: z.union([ z.lazy(() => PostUpdateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedUpdateWithoutHeartsInputSchema) ]),
  create: z.union([ z.lazy(() => PostCreateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedCreateWithoutHeartsInputSchema) ]),
  where: z.lazy(() => PostWhereInputSchema).optional()
}).strict();

export default PostUpsertWithoutHeartsInputSchema;
