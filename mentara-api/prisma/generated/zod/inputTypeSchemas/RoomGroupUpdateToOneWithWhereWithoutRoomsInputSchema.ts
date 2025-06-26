import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereInputSchema } from './RoomGroupWhereInputSchema';
import { RoomGroupUpdateWithoutRoomsInputSchema } from './RoomGroupUpdateWithoutRoomsInputSchema';
import { RoomGroupUncheckedUpdateWithoutRoomsInputSchema } from './RoomGroupUncheckedUpdateWithoutRoomsInputSchema';

export const RoomGroupUpdateToOneWithWhereWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupUpdateToOneWithWhereWithoutRoomsInput> = z.object({
  where: z.lazy(() => RoomGroupWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => RoomGroupUpdateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedUpdateWithoutRoomsInputSchema) ]),
}).strict();

export default RoomGroupUpdateToOneWithWhereWithoutRoomsInputSchema;
