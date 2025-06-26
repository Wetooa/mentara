import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutRoomInputSchema } from './PostCreateWithoutRoomInputSchema';
import { PostUncheckedCreateWithoutRoomInputSchema } from './PostUncheckedCreateWithoutRoomInputSchema';
import { PostCreateOrConnectWithoutRoomInputSchema } from './PostCreateOrConnectWithoutRoomInputSchema';
import { PostUpsertWithWhereUniqueWithoutRoomInputSchema } from './PostUpsertWithWhereUniqueWithoutRoomInputSchema';
import { PostCreateManyRoomInputEnvelopeSchema } from './PostCreateManyRoomInputEnvelopeSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateWithWhereUniqueWithoutRoomInputSchema } from './PostUpdateWithWhereUniqueWithoutRoomInputSchema';
import { PostUpdateManyWithWhereWithoutRoomInputSchema } from './PostUpdateManyWithWhereWithoutRoomInputSchema';
import { PostScalarWhereInputSchema } from './PostScalarWhereInputSchema';

export const PostUpdateManyWithoutRoomNestedInputSchema: z.ZodType<Prisma.PostUpdateManyWithoutRoomNestedInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutRoomInputSchema),z.lazy(() => PostCreateWithoutRoomInputSchema).array(),z.lazy(() => PostUncheckedCreateWithoutRoomInputSchema),z.lazy(() => PostUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostCreateOrConnectWithoutRoomInputSchema),z.lazy(() => PostCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PostUpsertWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => PostUpsertWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostCreateManyRoomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PostUpdateWithWhereUniqueWithoutRoomInputSchema),z.lazy(() => PostUpdateWithWhereUniqueWithoutRoomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PostUpdateManyWithWhereWithoutRoomInputSchema),z.lazy(() => PostUpdateManyWithWhereWithoutRoomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PostScalarWhereInputSchema),z.lazy(() => PostScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PostUpdateManyWithoutRoomNestedInputSchema;
