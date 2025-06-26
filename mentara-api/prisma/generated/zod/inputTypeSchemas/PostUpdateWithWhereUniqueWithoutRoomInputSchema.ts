import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostWhereUniqueInputSchema } from './PostWhereUniqueInputSchema';
import { PostUpdateWithoutRoomInputSchema } from './PostUpdateWithoutRoomInputSchema';
import { PostUncheckedUpdateWithoutRoomInputSchema } from './PostUncheckedUpdateWithoutRoomInputSchema';

export const PostUpdateWithWhereUniqueWithoutRoomInputSchema: z.ZodType<Prisma.PostUpdateWithWhereUniqueWithoutRoomInput> = z.object({
  where: z.lazy(() => PostWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PostUpdateWithoutRoomInputSchema),z.lazy(() => PostUncheckedUpdateWithoutRoomInputSchema) ]),
}).strict();

export default PostUpdateWithWhereUniqueWithoutRoomInputSchema;
