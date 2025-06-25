import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomCreateWithoutRoomGroupInputSchema } from './RoomCreateWithoutRoomGroupInputSchema';
import { RoomUncheckedCreateWithoutRoomGroupInputSchema } from './RoomUncheckedCreateWithoutRoomGroupInputSchema';
import { RoomCreateOrConnectWithoutRoomGroupInputSchema } from './RoomCreateOrConnectWithoutRoomGroupInputSchema';
import { RoomUpsertWithWhereUniqueWithoutRoomGroupInputSchema } from './RoomUpsertWithWhereUniqueWithoutRoomGroupInputSchema';
import { RoomCreateManyRoomGroupInputEnvelopeSchema } from './RoomCreateManyRoomGroupInputEnvelopeSchema';
import { RoomWhereUniqueInputSchema } from './RoomWhereUniqueInputSchema';
import { RoomUpdateWithWhereUniqueWithoutRoomGroupInputSchema } from './RoomUpdateWithWhereUniqueWithoutRoomGroupInputSchema';
import { RoomUpdateManyWithWhereWithoutRoomGroupInputSchema } from './RoomUpdateManyWithWhereWithoutRoomGroupInputSchema';
import { RoomScalarWhereInputSchema } from './RoomScalarWhereInputSchema';

export const RoomUncheckedUpdateManyWithoutRoomGroupNestedInputSchema: z.ZodType<Prisma.RoomUncheckedUpdateManyWithoutRoomGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomCreateWithoutRoomGroupInputSchema),z.lazy(() => RoomCreateWithoutRoomGroupInputSchema).array(),z.lazy(() => RoomUncheckedCreateWithoutRoomGroupInputSchema),z.lazy(() => RoomUncheckedCreateWithoutRoomGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomCreateOrConnectWithoutRoomGroupInputSchema),z.lazy(() => RoomCreateOrConnectWithoutRoomGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RoomUpsertWithWhereUniqueWithoutRoomGroupInputSchema),z.lazy(() => RoomUpsertWithWhereUniqueWithoutRoomGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomCreateManyRoomGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RoomWhereUniqueInputSchema),z.lazy(() => RoomWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RoomWhereUniqueInputSchema),z.lazy(() => RoomWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RoomWhereUniqueInputSchema),z.lazy(() => RoomWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RoomWhereUniqueInputSchema),z.lazy(() => RoomWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RoomUpdateWithWhereUniqueWithoutRoomGroupInputSchema),z.lazy(() => RoomUpdateWithWhereUniqueWithoutRoomGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RoomUpdateManyWithWhereWithoutRoomGroupInputSchema),z.lazy(() => RoomUpdateManyWithWhereWithoutRoomGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RoomScalarWhereInputSchema),z.lazy(() => RoomScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RoomUncheckedUpdateManyWithoutRoomGroupNestedInputSchema;
