import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';
import { RoomUpdateWithoutRoomGroupInputSchema } from './RoomUpdateWithoutRoomGroupInputSchema';
import { RoomUncheckedUpdateWithoutRoomGroupInputSchema } from './RoomUncheckedUpdateWithoutRoomGroupInputSchema';

export const RoomUpdateWithWhereUniqueWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUpdateWithWhereUniqueWithoutRoomGroupInput> = z.object({
  where: z.lazy(() => RoomWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RoomUpdateWithoutRoomGroupInputSchema),z.lazy(() => RoomUncheckedUpdateWithoutRoomGroupInputSchema) ]),
}).strict();

export default RoomUpdateWithWhereUniqueWithoutRoomGroupInputSchema;
