import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateWithoutCommunityInputSchema } from './RoomGroupCreateWithoutCommunityInputSchema';
import { RoomGroupUncheckedCreateWithoutCommunityInputSchema } from './RoomGroupUncheckedCreateWithoutCommunityInputSchema';
import { RoomGroupCreateOrConnectWithoutCommunityInputSchema } from './RoomGroupCreateOrConnectWithoutCommunityInputSchema';
import { RoomGroupCreateManyCommunityInputEnvelopeSchema } from './RoomGroupCreateManyCommunityInputEnvelopeSchema';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';

export const RoomGroupCreateNestedManyWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupCreateNestedManyWithoutCommunityInput> = z.object({
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutCommunityInputSchema),z.lazy(() => RoomGroupCreateWithoutCommunityInputSchema).array(),z.lazy(() => RoomGroupUncheckedCreateWithoutCommunityInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutCommunityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RoomGroupCreateOrConnectWithoutCommunityInputSchema),z.lazy(() => RoomGroupCreateOrConnectWithoutCommunityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RoomGroupCreateManyCommunityInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RoomGroupWhereUniqueInputSchema),z.lazy(() => RoomGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RoomGroupCreateNestedManyWithoutCommunityInputSchema;
