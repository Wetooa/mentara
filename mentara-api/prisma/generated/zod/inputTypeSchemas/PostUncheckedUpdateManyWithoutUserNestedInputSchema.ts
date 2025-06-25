import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutUserInputSchema } from './PostCreateWithoutUserInputSchema';
import { PostUncheckedCreateWithoutUserInputSchema } from './PostUncheckedCreateWithoutUserInputSchema';
import { PostCreateOrConnectWithoutUserInputSchema } from './PostCreateOrConnectWithoutUserInputSchema';
import { PostUpsertWithWhereUniqueWithoutUserInputSchema } from './PostUpsertWithWhereUniqueWithoutUserInputSchema';
import { PostCreateManyUserInputEnvelopeSchema } from './PostCreateManyUserInputEnvelopeSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateWithWhereUniqueWithoutUserInputSchema } from './PostUpdateWithWhereUniqueWithoutUserInputSchema';
import { PostUpdateManyWithWhereWithoutUserInputSchema } from './PostUpdateManyWithWhereWithoutUserInputSchema';
import { PostScalarWhereInputSchema } from './PostScalarWhereInputSchema';

export const PostUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PostUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutUserInputSchema),z.lazy(() => PostCreateWithoutUserInputSchema).array(),z.lazy(() => PostUncheckedCreateWithoutUserInputSchema),z.lazy(() => PostUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostCreateOrConnectWithoutUserInputSchema),z.lazy(() => PostCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PostUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PostUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PostUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PostUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PostUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PostUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PostScalarWhereInputSchema),z.lazy(() => PostScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PostUncheckedUpdateManyWithoutUserNestedInputSchema;
