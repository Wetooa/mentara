import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema } from './RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema';

export const RoomGroupUncheckedCreateInputSchema: z.ZodType<Prisma.RoomGroupUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  communityId: z.string(),
  rooms: z.lazy(() => RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema).optional()
}).strict();

export default RoomGroupUncheckedCreateInputSchema;
