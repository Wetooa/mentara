import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartCreateWithoutUserInputSchema } from './PostHeartCreateWithoutUserInputSchema';
import { PostHeartUncheckedCreateWithoutUserInputSchema } from './PostHeartUncheckedCreateWithoutUserInputSchema';
import { PostHeartCreateOrConnectWithoutUserInputSchema } from './PostHeartCreateOrConnectWithoutUserInputSchema';
import { PostHeartUpsertWithWhereUniqueWithoutUserInputSchema } from './PostHeartUpsertWithWhereUniqueWithoutUserInputSchema';
import { PostHeartCreateManyUserInputEnvelopeSchema } from './PostHeartCreateManyUserInputEnvelopeSchema';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartUpdateWithWhereUniqueWithoutUserInputSchema } from './PostHeartUpdateWithWhereUniqueWithoutUserInputSchema';
import { PostHeartUpdateManyWithWhereWithoutUserInputSchema } from './PostHeartUpdateManyWithWhereWithoutUserInputSchema';
import { PostHeartScalarWhereInputSchema } from './PostHeartScalarWhereInputSchema';

export const PostHeartUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PostHeartUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostHeartCreateWithoutUserInputSchema),z.lazy(() => PostHeartCreateWithoutUserInputSchema).array(),z.lazy(() => PostHeartUncheckedCreateWithoutUserInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostHeartCreateOrConnectWithoutUserInputSchema),z.lazy(() => PostHeartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PostHeartUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PostHeartUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostHeartCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PostHeartUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PostHeartUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PostHeartUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PostHeartUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PostHeartScalarWhereInputSchema),z.lazy(() => PostHeartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PostHeartUncheckedUpdateManyWithoutUserNestedInputSchema;
