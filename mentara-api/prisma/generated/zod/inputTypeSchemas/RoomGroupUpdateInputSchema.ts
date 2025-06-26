import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema } from './CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema';
import { RoomUpdateManyWithoutRoomGroupNestedInputSchema } from './RoomUpdateManyWithoutRoomGroupNestedInputSchema';

export const RoomGroupUpdateInputSchema: z.ZodType<Prisma.RoomGroupUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  community: z.lazy(() => CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema).optional(),
  rooms: z.lazy(() => RoomUpdateManyWithoutRoomGroupNestedInputSchema).optional()
}).strict();

export default RoomGroupUpdateInputSchema;
