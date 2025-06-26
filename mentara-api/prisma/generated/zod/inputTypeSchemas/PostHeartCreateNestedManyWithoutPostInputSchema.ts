import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartCreateWithoutPostInputSchema } from './PostHeartCreateWithoutPostInputSchema';
import { PostHeartUncheckedCreateWithoutPostInputSchema } from './PostHeartUncheckedCreateWithoutPostInputSchema';
import { PostHeartCreateOrConnectWithoutPostInputSchema } from './PostHeartCreateOrConnectWithoutPostInputSchema';
import { PostHeartCreateManyPostInputEnvelopeSchema } from './PostHeartCreateManyPostInputEnvelopeSchema';
import { PostHeartWhereUniqueInputSchema } from './PostHeartWhereUniqueInputSchema';

export const PostHeartCreateNestedManyWithoutPostInputSchema: z.ZodType<Prisma.PostHeartCreateNestedManyWithoutPostInput> = z.object({
  create: z.union([ z.lazy(() => PostHeartCreateWithoutPostInputSchema),z.lazy(() => PostHeartCreateWithoutPostInputSchema).array(),z.lazy(() => PostHeartUncheckedCreateWithoutPostInputSchema),z.lazy(() => PostHeartUncheckedCreateWithoutPostInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostHeartCreateOrConnectWithoutPostInputSchema),z.lazy(() => PostHeartCreateOrConnectWithoutPostInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostHeartCreateManyPostInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PostHeartWhereUniqueInputSchema),z.lazy(() => PostHeartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PostHeartCreateNestedManyWithoutPostInputSchema;
