import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { RoomGroupUpdateOneRequiredWithoutRoomsNestedInputSchema } from './RoomGroupUpdateOneRequiredWithoutRoomsNestedInputSchema';
import { PostUpdateManyWithoutRoomNestedInputSchema } from './PostUpdateManyWithoutRoomNestedInputSchema';

export const RoomUpdateInputSchema: z.ZodType<Prisma.RoomUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roomGroup: z.lazy(() => RoomGroupUpdateOneRequiredWithoutRoomsNestedInputSchema).optional(),
  posts: z.lazy(() => PostUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export default RoomUpdateInputSchema;
