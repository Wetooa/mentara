import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutHeartsInputSchema } from './PostCreateWithoutHeartsInputSchema';
import { PostUncheckedCreateWithoutHeartsInputSchema } from './PostUncheckedCreateWithoutHeartsInputSchema';
import { PostCreateOrConnectWithoutHeartsInputSchema } from './PostCreateOrConnectWithoutHeartsInputSchema';
import { PostUpsertWithoutHeartsInputSchema } from './PostUpsertWithoutHeartsInputSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateToOneWithWhereWithoutHeartsInputSchema } from './PostUpdateToOneWithWhereWithoutHeartsInputSchema';
import { PostUpdateWithoutHeartsInputSchema } from './PostUpdateWithoutHeartsInputSchema';
import { PostUncheckedUpdateWithoutHeartsInputSchema } from './PostUncheckedUpdateWithoutHeartsInputSchema';

export const PostUpdateOneRequiredWithoutHeartsNestedInputSchema: z.ZodType<Prisma.PostUpdateOneRequiredWithoutHeartsNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedCreateWithoutHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PostCreateOrConnectWithoutHeartsInputSchema).optional(),
  upsert: z.lazy(() => PostUpsertWithoutHeartsInputSchema).optional(),
  connect: z.lazy(() => PostWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PostUpdateToOneWithWhereWithoutHeartsInputSchema),z.lazy(() => PostUpdateWithoutHeartsInputSchema),z.lazy(() => PostUncheckedUpdateWithoutHeartsInputSchema) ]).optional(),
}).strict();

export default PostUpdateOneRequiredWithoutHeartsNestedInputSchema;
