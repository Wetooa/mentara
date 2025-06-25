import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateWithoutRoomInputSchema } from './PostUpdateWithoutRoomInputSchema';
import { PostUncheckedUpdateWithoutRoomInputSchema } from './PostUncheckedUpdateWithoutRoomInputSchema';
import { PostCreateWithoutRoomInputSchema } from './PostCreateWithoutRoomInputSchema';
import { PostUncheckedCreateWithoutRoomInputSchema } from './PostUncheckedCreateWithoutRoomInputSchema';

export const PostUpsertWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.PostUpsertWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PostUpdateWithoutRoomInputSchema),z.lazy(() => PostUncheckedUpdateWithoutRoomInputSchema) ]),
  create: z.union([ z.lazy(() => PostCreateWithoutRoomInputSchema),z.lazy(() => PostUncheckedCreateWithoutRoomInputSchema) ]),
}).strict();

export default PostUpsertWithWhereUniqueWithoutRoomInputSchema;
