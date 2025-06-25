import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { PostUpdateManyWithoutRoomNestedInputSchema } from './PostUpdateManyWithoutRoomNestedInputSchema';

export const RoomUpdateWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUpdateWithoutRoomGroupInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  posts: z.lazy(() => PostUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export default RoomUpdateWithoutRoomGroupInputSchema;
