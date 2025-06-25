import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereInputSchema } from './RoomWhereInputSchema';
import { RoomUpdateWithoutPostsInputSchema } from './RoomUpdateWithoutPostsInputSchema';
import { RoomUncheckedUpdateWithoutPostsInputSchema } from './RoomUncheckedUpdateWithoutPostsInputSchema';

export const RoomUpdateToOneWithWhereWithoutPostsInputSchema: z.ZodType<Prisma.RoomUpdateToOneWithWhereWithoutPostsInput> = z.object({
  where: z.lazy(() => RoomWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => RoomUpdateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutPostsInputSchema) ]),
}).strict();

export default RoomUpdateToOneWithWhereWithoutPostsInputSchema;
