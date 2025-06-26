import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutHeartsInputSchema } from './PostCreateWithoutHeartsInputSchema';
import { PostUncheckedCreateWithoutHeartsInputSchema } from './PostUncheckedCreateWithoutHeartsInputSchema';
import { PostCreateOrConnectWithoutHeartsInputSchema } from './PostCreateOrConnectWithoutHeartsInputSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';

export const PostCreateNestedOneWithoutHeartsInputSchema: z.ZodType<Prisma.PostCreateNestedOneWithoutHeartsInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedCreateWithoutHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PostCreateOrConnectWithoutHeartsInputSchema).optional(),
  connect: z.lazy(() => PostWhereUniqueInputSchema).optional()
}).strict();

export default PostCreateNestedOneWithoutHeartsInputSchema;
