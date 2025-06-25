import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RoomGroupUncheckedCreateWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupUncheckedCreateWithoutRoomsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  communityId: z.string()
}).strict();

export default RoomGroupUncheckedCreateWithoutRoomsInputSchema;
