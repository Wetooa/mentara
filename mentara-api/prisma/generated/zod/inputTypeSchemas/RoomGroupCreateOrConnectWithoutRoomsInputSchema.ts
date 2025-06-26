import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';
import { RoomGroupCreateWithoutRoomsInputSchema } from './RoomGroupCreateWithoutRoomsInputSchema';
import { RoomGroupUncheckedCreateWithoutRoomsInputSchema } from './RoomGroupUncheckedCreateWithoutRoomsInputSchema';

export const RoomGroupCreateOrConnectWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupCreateOrConnectWithoutRoomsInput> = z.object({
  where: z.lazy(() => RoomGroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutRoomsInputSchema) ]),
}).strict();

export default RoomGroupCreateOrConnectWithoutRoomsInputSchema;
