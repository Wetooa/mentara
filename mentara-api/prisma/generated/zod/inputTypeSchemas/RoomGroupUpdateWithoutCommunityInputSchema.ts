import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { RoomUpdateManyWithoutRoomGroupNestedInputSchema } from './RoomUpdateManyWithoutRoomGroupNestedInputSchema';

export const RoomGroupUpdateWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupUpdateWithoutCommunityInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rooms: z.lazy(() => RoomUpdateManyWithoutRoomGroupNestedInputSchema).optional()
}).strict();

export default RoomGroupUpdateWithoutCommunityInputSchema;
