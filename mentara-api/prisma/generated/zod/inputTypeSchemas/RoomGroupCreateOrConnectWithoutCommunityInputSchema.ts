import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';
import { RoomGroupCreateWithoutCommunityInputSchema } from './RoomGroupCreateWithoutCommunityInputSchema';
import { RoomGroupUncheckedCreateWithoutCommunityInputSchema } from './RoomGroupUncheckedCreateWithoutCommunityInputSchema';

export const RoomGroupCreateOrConnectWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupCreateOrConnectWithoutCommunityInput> = z.object({
  where: z.lazy(() => RoomGroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutCommunityInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutCommunityInputSchema) ]),
}).strict();

export default RoomGroupCreateOrConnectWithoutCommunityInputSchema;
