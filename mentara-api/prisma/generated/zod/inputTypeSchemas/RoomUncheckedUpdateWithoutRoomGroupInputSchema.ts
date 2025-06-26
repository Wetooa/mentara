import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { PostUncheckedUpdateManyWithoutRoomNestedInputSchema } from './PostUncheckedUpdateManyWithoutRoomNestedInputSchema';

export const RoomUncheckedUpdateWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateWithoutRoomGroupInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  posts: z.lazy(() => PostUncheckedUpdateManyWithoutRoomNestedInputSchema).optional()
}).strict();

export default RoomUncheckedUpdateWithoutRoomGroupInputSchema;
