import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedManyWithoutRoomInputSchema } from './PostCreateNestedManyWithoutRoomInputSchema';

export const RoomCreateWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomCreateWithoutRoomGroupInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  posts: z.lazy(() => PostCreateNestedManyWithoutRoomInputSchema).optional()
}).strict();

export default RoomCreateWithoutRoomGroupInputSchema;
