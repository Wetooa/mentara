import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutUserInputSchema } from './PostCreateWithoutUserInputSchema';
import { PostUncheckedCreateWithoutUserInputSchema } from './PostUncheckedCreateWithoutUserInputSchema';
import { PostCreateOrConnectWithoutUserInputSchema } from './PostCreateOrConnectWithoutUserInputSchema';
import { PostCreateManyUserInputEnvelopeSchema } from './PostCreateManyUserInputEnvelopeSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';

export const PostCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PostCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutUserInputSchema),z.lazy(() => PostCreateWithoutUserInputSchema).array(),z.lazy(() => PostUncheckedCreateWithoutUserInputSchema),z.lazy(() => PostUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostCreateOrConnectWithoutUserInputSchema),z.lazy(() => PostCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PostCreateNestedManyWithoutUserInputSchema;
