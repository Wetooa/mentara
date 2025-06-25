import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateNestedOneWithoutRoomGroupsInputSchema } from './CommunityCreateNestedOneWithoutRoomGroupsInputSchema';
import { RoomCreateNestedManyWithoutRoomGroupInputSchema } from './RoomCreateNestedManyWithoutRoomGroupInputSchema';

export const RoomGroupCreateInputSchema: z.ZodType<Prisma.RoomGroupCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  community: z.lazy(() => CommunityCreateNestedOneWithoutRoomGroupsInputSchema),
  rooms: z.lazy(() => RoomCreateNestedManyWithoutRoomGroupInputSchema).optional()
}).strict();

export default RoomGroupCreateInputSchema;
