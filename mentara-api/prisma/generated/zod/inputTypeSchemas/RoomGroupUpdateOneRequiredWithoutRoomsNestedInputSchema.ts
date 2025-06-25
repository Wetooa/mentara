import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateWithoutRoomsInputSchema } from './RoomGroupCreateWithoutRoomsInputSchema';
import { RoomGroupUncheckedCreateWithoutRoomsInputSchema } from './RoomGroupUncheckedCreateWithoutRoomsInputSchema';
import { RoomGroupCreateOrConnectWithoutRoomsInputSchema } from './RoomGroupCreateOrConnectWithoutRoomsInputSchema';
import { RoomGroupUpsertWithoutRoomsInputSchema } from './RoomGroupUpsertWithoutRoomsInputSchema';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';
import { RoomGroupUpdateToOneWithWhereWithoutRoomsInputSchema } from './RoomGroupUpdateToOneWithWhereWithoutRoomsInputSchema';
import { RoomGroupUpdateWithoutRoomsInputSchema } from './RoomGroupUpdateWithoutRoomsInputSchema';
import { RoomGroupUncheckedUpdateWithoutRoomsInputSchema } from './RoomGroupUncheckedUpdateWithoutRoomsInputSchema';

export const RoomGroupUpdateOneRequiredWithoutRoomsNestedInputSchema: z.ZodType<Prisma.RoomGroupUpdateOneRequiredWithoutRoomsNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutRoomsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RoomGroupCreateOrConnectWithoutRoomsInputSchema).optional(),
  upsert: z.lazy(() => RoomGroupUpsertWithoutRoomsInputSchema).optional(),
  connect: z.lazy(() => RoomGroupWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RoomGroupUpdateToOneWithWhereWithoutRoomsInputSchema),z.lazy(() => RoomGroupUpdateWithoutRoomsInputSchema),z.lazy(() => RoomGroupUncheckedUpdateWithoutRoomsInputSchema) ]).optional(),
}).strict();

export default RoomGroupUpdateOneRequiredWithoutRoomsNestedInputSchema;
