import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostCreateWithoutRoomInputSchema } from './PostCreateWithoutRoomInputSchema';
import { PostUncheckedCreateWithoutRoomInputSchema } from './PostUncheckedCreateWithoutRoomInputSchema';

export const PostCreateOrConnectWithoutRoomInputSchema: z.ZodType<Prisma.PostCreateOrConnectWithoutRoomInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PostCreateWithoutRoomInputSchema),z.lazy(() => PostUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export default PostCreateOrConnectWithoutRoomInputSchema;
