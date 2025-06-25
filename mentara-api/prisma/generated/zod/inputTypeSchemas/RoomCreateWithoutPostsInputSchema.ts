import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateNestedOneWithoutRoomsInputSchema } from './RoomGroupCreateNestedOneWithoutRoomsInputSchema';

export const RoomCreateWithoutPostsInputSchema: z.ZodType<Prisma.RoomCreateWithoutPostsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  roomGroup: z.lazy(() => RoomGroupCreateNestedOneWithoutRoomsInputSchema)
}).strict();

export default RoomCreateWithoutPostsInputSchema;
