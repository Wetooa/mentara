import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateNestedOneWithoutRoomGroupsInputSchema } from './CommunityCreateNestedOneWithoutRoomGroupsInputSchema';

export const RoomGroupCreateWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupCreateWithoutRoomsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  community: z.lazy(() => CommunityCreateNestedOneWithoutRoomGroupsInputSchema)
}).strict();

export default RoomGroupCreateWithoutRoomsInputSchema;
