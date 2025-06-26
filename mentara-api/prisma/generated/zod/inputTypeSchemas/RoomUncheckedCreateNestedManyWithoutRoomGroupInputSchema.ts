import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomCreateWithoutRoomGroupInputSchema } from './RoomCreateWithoutRoomGroupInputSchema';
import { RoomUncheckedCreateWithoutRoomGroupInputSchema } from './RoomUncheckedCreateWithoutRoomGroupInputSchema';
import { RoomCreateOrConnectWithoutRoomGroupInputSchema } from './RoomCreateOrConnectWithoutRoomGroupInputSchema';
import { RoomCreateManyRoomGroupInputEnvelopeSchema } from './RoomCreateManyRoomGroupInputEnvelopeSchema';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';

export const RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema: z.ZodType<Prisma.RoomUncheckedCreateNestedManyWithoutRoomGroupInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutRoomGroupInputSchema),z.lazy(() => RoomCreateWithoutRoomGroupInputSchema).array(),z.lazy(() => RoomUncheckedCreateWithoutRoomGroupInputSchema),z.lazy(() => RoomUncheckedCreateWithoutRoomGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomCreateOrConnectWithoutRoomGroupInputSchema),z.lazy(() => RoomCreateOrConnectWithoutRoomGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomCreateManyRoomGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RoomWhereUniqueInputSchema),z.lazy(() => RoomWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RoomUncheckedCreateNestedManyWithoutRoomGroupInputSchema;
