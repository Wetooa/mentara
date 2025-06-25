import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateWithoutCommunityInputSchema } from './RoomGroupCreateWithoutCommunityInputSchema';
import { RoomGroupUncheckedCreateWithoutCommunityInputSchema } from './RoomGroupUncheckedCreateWithoutCommunityInputSchema';
import { RoomGroupCreateOrConnectWithoutCommunityInputSchema } from './RoomGroupCreateOrConnectWithoutCommunityInputSchema';
import { RoomGroupUpsertWithWhereUniqueWithoutCommunityInputSchema } from './RoomGroupUpsertWithWhereUniqueWithoutCommunityInputSchema';
import { RoomGroupCreateManyCommunityInputEnvelopeSchema } from './RoomGroupCreateManyCommunityInputEnvelopeSchema';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';
import { RoomGroupUpdateWithWhereUniqueWithoutCommunityInputSchema } from './RoomGroupUpdateWithWhereUniqueWithoutCommunityInputSchema';
import { RoomGroupUpdateManyWithWhereWithoutCommunityInputSchema } from './RoomGroupUpdateManyWithWhereWithoutCommunityInputSchema';
import { RoomGroupScalarWhereInputSchema } from './RoomGroupScalarWhereInputSchema';

export const RoomGroupUncheckedUpdateManyWithoutCommunityNestedInputSchema: z.ZodType<Prisma.RoomGroupUncheckedUpdateManyWithoutCommunityNestedInput> = z.object({
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutCommunityInputSchema),z.lazy(() => RoomGroupCreateWithoutCommunityInputSchema).array(),z.lazy(() => RoomGroupUncheckedCreateWithoutCommunityInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutCommunityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomGroupCreateOrConnectWithoutCommunityInputSchema),z.lazy(() => RoomGroupCreateOrConnectWithoutCommunityInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RoomGroupUpsertWithWhereUniqueWithoutCommunityInputSchema),z.lazy(() => RoomGroupUpsertWithWhereUniqueWithoutCommunityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomGroupCreateManyCommunityInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RoomGroupWhereUniqueInputSchema),z.lazy(() => RoomGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RoomGroupWhereUniqueInputSchema),z.lazy(() => RoomGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RoomGroupWhereUniqueInputSchema),z.lazy(() => RoomGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RoomGroupWhereUniqueInputSchema),z.lazy(() => RoomGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RoomGroupUpdateWithWhereUniqueWithoutCommunityInputSchema),z.lazy(() => RoomGroupUpdateWithWhereUniqueWithoutCommunityInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RoomGroupUpdateManyWithWhereWithoutCommunityInputSchema),z.lazy(() => RoomGroupUpdateManyWithWhereWithoutCommunityInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RoomGroupScalarWhereInputSchema),z.lazy(() => RoomGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RoomGroupUncheckedUpdateManyWithoutCommunityNestedInputSchema;
