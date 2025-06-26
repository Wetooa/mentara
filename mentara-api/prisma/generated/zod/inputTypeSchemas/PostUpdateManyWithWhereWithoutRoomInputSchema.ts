import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostScalarWhereInputSchema } from './PostScalarWhereInputSchema';
import { PostUpdateManyMutationInputSchema } from './PostUpdateManyMutationInputSchema';
import { PostUncheckedUpdateManyWithoutRoomInputSchema } from './PostUncheckedUpdateManyWithoutRoomInputSchema';

export const PostUpdateManyWithWhereWithoutRoomInputSchema: z.ZodType<Prisma.PostUpdateManyWithWhereWithoutRoomInput> = z.object({
  where: z.lazy(() => PostScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PostUpdateManyMutationInputSchema),z.lazy(() => PostUncheckedUpdateManyWithoutRoomInputSchema) ]),
}).strict();

export default PostUpdateManyWithWhereWithoutRoomInputSchema;
