import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomScalarWhereInputSchema } from './RoomScalarWhereInputSchema';
import { RoomUpdateManyMutationInputSchema } from './RoomUpdateManyMutationInputSchema';
import { RoomUncheckedUpdateManyWithoutRoomGroupInputSchema } from './RoomUncheckedUpdateManyWithoutRoomGroupInputSchema';

export const RoomUpdateManyWithWhereWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUpdateManyWithWhereWithoutRoomGroupInput> = z.object({
  where: z.lazy(() => RoomScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RoomUpdateManyMutationInputSchema),z.lazy(() => RoomUncheckedUpdateManyWithoutRoomGroupInputSchema) ]),
}).strict();

export default RoomUpdateManyWithWhereWithoutRoomGroupInputSchema;
