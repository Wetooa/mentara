import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartCreateWithoutUserInputSchema } from './PostHeartCreateWithoutUserInputSchema';
import { PostHeartUncheckedCreateWithoutUserInputSchema } from './PostHeartUncheckedCreateWithoutUserInputSchema';
import { PostHeartCreateOrConnectWithoutUserInputSchema } from './PostHeartCreateOrConnectWithoutUserInputSchema';
import { PostHeartCreateManyUserInputEnvelopeSchema } from './PostHeartCreateManyUserInputEnvelopeSchema';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';

export const PostHeartCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PostHeartCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PostHeartCreateWithoutUserInputSchema),z.lazy(() => PostHeartCreateWithoutUserInputSchema).array(),z.lazy(() => PostHeartUncheckedCreateWithoutUserInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostHeartCreateOrConnectWithoutUserInputSchema),z.lazy(() => PostHeartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostHeartCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PostHeartCreateNestedManyWithoutUserInputSchema;
