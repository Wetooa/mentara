import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostUncheckedCreateNestedManyWithoutRoomInputSchema } from './PostUncheckedCreateNestedManyWithoutRoomInputSchema';

export const RoomUncheckedCreateWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUncheckedCreateWithoutRoomGroupInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  posts: z.lazy(() => PostUncheckedCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export default RoomUncheckedCreateWithoutRoomGroupInputSchema;
