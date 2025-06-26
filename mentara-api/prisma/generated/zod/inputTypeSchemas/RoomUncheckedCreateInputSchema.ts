import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostUncheckedCreateNestedManyWithoutRoomInputSchema } from './PostUncheckedCreateNestedManyWithoutRoomInputSchema';

export const RoomUncheckedCreateInputSchema: z.ZodType<Prisma.RoomUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  roomGroupId: z.string(),
  posts: z.lazy(() => PostUncheckedCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export default RoomUncheckedCreateInputSchema;
