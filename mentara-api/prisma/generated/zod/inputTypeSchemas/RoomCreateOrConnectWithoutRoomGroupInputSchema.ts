import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';
import { RoomCreateWithoutRoomGroupInputSchema } from './RoomCreateWithoutRoomGroupInputSchema';
import { RoomUncheckedCreateWithoutRoomGroupInputSchema } from './RoomUncheckedCreateWithoutRoomGroupInputSchema';

export const RoomCreateOrConnectWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomCreateOrConnectWithoutRoomGroupInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomCreateWithoutRoomGroupInputSchema),z.lazy(() => RoomUncheckedCreateWithoutRoomGroupInputSchema) ]),
}).strict();

export default RoomCreateOrConnectWithoutRoomGroupInputSchema;
