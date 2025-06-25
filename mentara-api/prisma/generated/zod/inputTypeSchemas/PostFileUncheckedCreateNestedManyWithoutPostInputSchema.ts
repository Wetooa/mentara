import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileCreateWithoutPostInputSchema } from './PostFileCreateWithoutPostInputSchema';
import { PostFileUncheckedCreateWithoutPostInputSchema } from './PostFileUncheckedCreateWithoutPostInputSchema';
import { PostFileCreateOrConnectWithoutPostInputSchema } from './PostFileCreateOrConnectWithoutPostInputSchema';
import { PostFileCreateManyPostInputEnvelopeSchema } from './PostFileCreateManyPostInputEnvelopeSchema';
import { PostFileWhereUniqueInputSchema } from './PostFileWhereUniqueInputSchema';

export const PostFileUncheckedCreateNestedManyWithoutPostInputSchema: z.ZodType<Prisma.PostFileUncheckedCreateNestedManyWithoutPostInput> = z.object({
  create: z.union([ z.lazy(() => PostFileCreateWithoutPostInputSchema),z.lazy(() => PostFileCreateWithoutPostInputSchema).array(),z.lazy(() => PostFileUncheckedCreateWithoutPostInputSchema),z.lazy(() => PostFileUncheckedCreateWithoutPostInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostFileCreateOrConnectWithoutPostInputSchema),z.lazy(() => PostFileCreateOrConnectWithoutPostInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostFileCreateManyPostInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PostFileWhereUniqueInputSchema),z.lazy(() => PostFileWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PostFileUncheckedCreateNestedManyWithoutPostInputSchema;
