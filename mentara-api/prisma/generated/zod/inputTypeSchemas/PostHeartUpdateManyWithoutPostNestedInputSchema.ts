import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartCreateWithoutPostInputSchema } from './PostHeartCreateWithoutPostInputSchema';
import { PostHeartUncheckedCreateWithoutPostInputSchema } from './PostHeartUncheckedCreateWithoutPostInputSchema';
import { PostHeartCreateOrConnectWithoutPostInputSchema } from './PostHeartCreateOrConnectWithoutPostInputSchema';
import { PostHeartUpsertWithWhereUniqueWithoutPostInputSchema } from './PostHeartUpsertWithWhereUniqueWithoutPostInputSchema';
import { PostHeartCreateManyPostInputEnvelopeSchema } from './PostHeartCreateManyPostInputEnvelopeSchema';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';
import { PostHeartUpdateWithWhereUniqueWithoutPostInputSchema } from './PostHeartUpdateWithWhereUniqueWithoutPostInputSchema';
import { PostHeartUpdateManyWithWhereWithoutPostInputSchema } from './PostHeartUpdateManyWithWhereWithoutPostInputSchema';
import { PostHeartScalarWhereInputSchema } from './PostHeartScalarWhereInputSchema';

export const PostHeartUpdateManyWithoutPostNestedInputSchema: z.ZodType<Prisma.PostHeartUpdateManyWithoutPostNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostHeartCreateWithoutPostInputSchema),z.lazy(() => PostHeartCreateWithoutPostInputSchema).array(),z.lazy(() => PostHeartUncheckedCreateWithoutPostInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutPostInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostHeartCreateOrConnectWithoutPostInputSchema),z.lazy(() => PostHeartCreateOrConnectWithoutPostInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PostHeartUpsertWithWhereUniqueWithoutPostInputSchema),z.lazy(() => PostHeartUpsertWithWhereUniqueWithoutPostInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostHeartCreateManyPostInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PostHeartUpdateWithWhereUniqueWithoutPostInputSchema),z.lazy(() => PostHeartUpdateWithWhereUniqueWithoutPostInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PostHeartUpdateManyWithWhereWithoutPostInputSchema),z.lazy(() => PostHeartUpdateManyWithWhereWithoutPostInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PostHeartScalarWhereInputSchema),z.lazy(() => PostHeartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PostHeartUpdateManyWithoutPostNestedInputSchema;
