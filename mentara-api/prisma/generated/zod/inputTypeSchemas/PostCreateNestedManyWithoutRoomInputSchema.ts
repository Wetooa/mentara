import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateWithoutRoomInputSchema } from './PostCreateWithoutRoomInputSchema';
import { PostUncheckedCreateWithoutRoomInputSchema } from './PostUncheckedCreateWithoutRoomInputSchema';
import { PostCreateOrConnectWithoutRoomInputSchema } from './PostCreateOrConnectWithoutRoomInputSchema';
import { PostCreateManyRoomInputEnvelopeSchema } from './PostCreateManyRoomInputEnvelopeSchema';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';

export const PostCreateNestedManyWithoutRoomInputSchema: z.ZodType<Prisma.PostCreateNestedManyWithoutRoomInput> = z.object({
  create: z.union([ z.lazy(() => PostCreateWithoutRoomInputSchema),z.lazy(() => PostCreateWithoutRoomInputSchema).array(),z.lazy(() => PostUncheckedCreateWithoutRoomInputSchema),z.lazy(() => PostUncheckedCreateWithoutRoomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PostCreateOrConnectWithoutRoomInputSchema),z.lazy(() => PostCreateOrConnectWithoutRoomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PostCreateManyRoomInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PostWhereUniqueInputSchema),z.lazy(() => PostWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PostCreateNestedManyWithoutRoomInputSchema;
