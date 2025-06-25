import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema } from './CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema';

export const RoomGroupUpdateWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupUpdateWithoutRoomsInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  community: z.lazy(() => CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema).optional()
}).strict();

export default RoomGroupUpdateWithoutRoomsInputSchema;
