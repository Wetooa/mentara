import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomUpdateWithoutPostsInputSchema } from './RoomUpdateWithoutPostsInputSchema';
import { RoomUncheckedUpdateWithoutPostsInputSchema } from './RoomUncheckedUpdateWithoutPostsInputSchema';
import { RoomCreateWithoutPostsInputSchema } from './RoomCreateWithoutPostsInputSchema';
import { RoomUncheckedCreateWithoutPostsInputSchema } from './RoomUncheckedCreateWithoutPostsInputSchema';
import { RoomWhereInputSchema } from './RoomWhereInputSchema';

export const RoomUpsertWithoutPostsInputSchema: z.ZodType<Prisma.RoomUpsertWithoutPostsInput> = z.object({
  update: z.union([ z.lazy(() => RoomUpdateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutPostsInputSchema) ]),
  create: z.union([ z.lazy(() => RoomCreateWithoutPostsInputSchema),z.lazy(() => RoomUncheckedCreateWithoutPostsInputSchema) ]),
  where: z.lazy(() => RoomWhereInputSchema).optional()
}).strict();

export default RoomUpsertWithoutPostsInputSchema;
