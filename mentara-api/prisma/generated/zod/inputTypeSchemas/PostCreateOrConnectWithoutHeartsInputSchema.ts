import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostCreateWithoutHeartsInputSchema } from './PostCreateWithoutHeartsInputSchema';
import { PostUncheckedCreateWithoutHeartsInputSchema } from './PostUncheckedCreateWithoutHeartsInputSchema';

export const PostCreateOrConnectWithoutHeartsInputSchema: z.ZodType<Prisma.PostCreateOrConnectWithoutHeartsInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostCreateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedCreateWithoutHeartsInputSchema) ]),
}).strict();

export default PostCreateOrConnectWithoutHeartsInputSchema;
