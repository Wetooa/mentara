import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateWithoutRoomsInputSchema } from './RoomGroupCreateWithoutRoomsInputSchema';
import { RoomGroupUncheckedCreateWithoutRoomsInputSchema } from './RoomGroupUncheckedCreateWithoutRoomsInputSchema';
import { RoomGroupCreateOrConnectWithoutRoomsInputSchema } from './RoomGroupCreateOrConnectWithoutRoomsInputSchema';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';

export const RoomGroupCreateNestedOneWithoutRoomsInputSchema: z.ZodType<Prisma.RoomGroupCreateNestedOneWithoutRoomsInput> = z.object({
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutRoomsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomGroupCreateOrConnectWithoutRoomsInputSchema).optional(),
  connect: z.lazy(() => RoomGroupWhereUniqueInputSchema).optional()
}).strict();

export default RoomGroupCreateNestedOneWithoutRoomsInputSchema;
