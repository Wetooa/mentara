import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RoomCreateManyRoomGroupInputSchema: z.ZodType<Prisma.RoomCreateManyRoomGroupInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int()
}).strict();

export default RoomCreateManyRoomGroupInputSchema;
