import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema } from './RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema';

export const RoomGroupUncheckedCreateWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupUncheckedCreateWithoutCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  rooms: z.lazy(() => RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema).optional()
}).strict();

export default RoomGroupUncheckedCreateWithoutCommunityInputSchema;
