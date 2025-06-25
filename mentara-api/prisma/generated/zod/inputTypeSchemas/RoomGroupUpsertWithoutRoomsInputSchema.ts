import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupUpdateWithoutRoomsInputSchema } from './RoomGroupUpdateWithoutRoomsInputSchema';
import { RoomGroupUncheckedUpdateWithoutRoomsInputSchema } from './RoomGroupUncheckedUpdateWithoutRoomsInputSchema';
import { RoomGroupCreateWithoutRoomsInputSchema } from './RoomGroupCreateWithoutRoomsInputSchema';
import { RoomGroupUncheckedCreateWithoutRoomsInputSchema } from './RoomGroupUncheckedCreateWithoutRoomsInputSchema';
import { RoomGroupWhereInputSchema } from './RoomGroupWhereInputSchema';

export const RoomGroupUpsertWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupUpsertWithoutRoomsInput> = z.object({
  update: z.union([ z.lazy(() => RoomGroupUpdateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedUpdateWithoutRoomsInputSchema) ]),
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutRoomsInputSchema) ]),
  where: z.lazy(() => RoomGroupWhereInputSchema).optional()
}).strict();

export default RoomGroupUpsertWithoutRoomsInputSchema;
