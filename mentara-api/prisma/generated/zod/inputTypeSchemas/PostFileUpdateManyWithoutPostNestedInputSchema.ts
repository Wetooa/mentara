import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileCreateWithoutPostInputSchema } from './PostFileCreateWithoutPostInputSchema';
import { PostFileUncheckedCreateWithoutPostInputSchema } from './PostFileUncheckedCreateWithoutPostInputSchema';
import { PostFileCreateOrConnectWithoutPostInputSchema } from './PostFileCreateOrConnectWithoutPostInputSchema';
import { PostFileUpsertWithWhereUniqueWithoutPostInputSchema } from './PostFileUpsertWithWhereUniqueWithoutPostInputSchema';
import { PostFileCreateManyPostInputEnvelopeSchema } from './PostFileCreateManyPostInputEnvelopeSchema';
import { PostFileWhereUniqueInputSchema } from './PostFileWhereUniqueInputSchema';
import { PostFileUpdateWithWhereUniqueWithoutPostInputSchema } from './PostFileUpdateWithWhereUniqueWithoutPostInputSchema';
import { PostFileUpdateManyWithWhereWithoutPostInputSchema } from './PostFileUpdateManyWithWhereWithoutPostInputSchema';
import { PostFileScalarWhereInputSchema } from './PostFileScalarWhereInputSchema';

export const PostFileUpdateManyWithoutPostNestedInputSchema: z.ZodType<Prisma.PostFileUpdateManyWithoutPostNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostFileCreateWithoutPostInputSchema),z.lazy(() => PostFileCreateWithoutPostInputSchema).array(),z.lazy(() => PostFileUncheckedCreateWithoutPostInputSchema),z.lazy(() => PostFileUncheckedCreateWithoutPostInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostFileCreateOrConnectWithoutPostInputSchema),z.lazy(() => PostFileCreateOrConnectWithoutPostInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PostFileUpsertWithWhereUniqueWithoutPostInputSchema),z.lazy(() => PostFileUpsertWithWhereUniqueWithoutPostInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostFileCreateManyPostInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PostFileWhereUniqueInputSchema),z.lazy(() => PostFileWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PostFileWhereUniqueInputSchema),z.lazy(() => PostFileWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PostFileWhereUniqueInputSchema),z.lazy(() => PostFileWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PostFileWhereUniqueInputSchema),z.lazy(() => PostFileWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PostFileUpdateWithWhereUniqueWithoutPostInputSchema),z.lazy(() => PostFileUpdateWithWhereUniqueWithoutPostInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PostFileUpdateManyWithWhereWithoutPostInputSchema),z.lazy(() => PostFileUpdateManyWithWhereWithoutPostInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PostFileScalarWhereInputSchema),z.lazy(() => PostFileScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PostFileUpdateManyWithoutPostNestedInputSchema;
