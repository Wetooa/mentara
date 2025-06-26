import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';
import { RoomUpdateWithoutRoomGroupInputSchema } from './RoomUpdateWithoutRoomGroupInputSchema';
import { RoomUncheckedUpdateWithoutRoomGroupInputSchema } from './RoomUncheckedUpdateWithoutRoomGroupInputSchema';
import { RoomCreateWithoutRoomGroupInputSchema } from './RoomCreateWithoutRoomGroupInputSchema';
import { RoomUncheckedCreateWithoutRoomGroupInputSchema } from './RoomUncheckedCreateWithoutRoomGroupInputSchema';

export const RoomUpsertWithWhereUniqueWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUpsertWithWhereUniqueWithoutRoomGroupInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RoomUpdateWithoutRoomGroupInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutRoomGroupInputSchema) ]),
  create: z.union([ z.lazy(() => RoomCreateWithoutRoomGroupInputSchema),z.lazy(() => RoomUncheckedCreateWithoutRoomGroupInputSchema) ]),
}).strict();

export default RoomUpsertWithWhereUniqueWithoutRoomGroupInputSchema;
