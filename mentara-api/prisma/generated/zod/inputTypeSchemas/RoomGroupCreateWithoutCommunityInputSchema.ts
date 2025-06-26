import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomCreateNestedManyWithoutRoomGroupInputSchema } from './RoomCreateNestedManyWithoutRoomGroupInputSchema';

export const RoomGroupCreateWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupCreateWithoutCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  rooms: z.lazy(() => RoomCreateNestedManyWithoutRoomGroupInputSchema).optional()
}).strict();

export default RoomGroupCreateWithoutCommunityInputSchema;
