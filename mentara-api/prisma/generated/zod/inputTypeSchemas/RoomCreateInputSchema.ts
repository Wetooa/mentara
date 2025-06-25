import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateNestedOneWithoutRoomsInputSchema } from './RoomGroupCreateNestedOneWithoutRoomsInputSchema';
import { PostCreateNestedManyWithoutRoomInputSchema } from './PostCreateNestedManyWithoutRoomInputSchema';

export const RoomCreateInputSchema: z.ZodType<Prisma.RoomCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  roomGroup: z.lazy(() => RoomGroupCreateNestedOneWithoutRoomsInputSchema),
  posts: z.lazy(() => PostCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export default RoomCreateInputSchema;
