import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';
import { RoomGroupUpdateWithoutCommunityInputSchema } from './RoomGroupUpdateWithoutCommunityInputSchema';
import { RoomGroupUncheckedUpdateWithoutCommunityInputSchema } from './RoomGroupUncheckedUpdateWithoutCommunityInputSchema';
import { RoomGroupCreateWithoutCommunityInputSchema } from './RoomGroupCreateWithoutCommunityInputSchema';
import { RoomGroupUncheckedCreateWithoutCommunityInputSchema } from './RoomGroupUncheckedCreateWithoutCommunityInputSchema';

export const RoomGroupUpsertWithWhereUniqueWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupUpsertWithWhereUniqueWithoutCommunityInput> = z.object({
  where: z.lazy(() => RoomGroupWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RoomGroupUpdateWithoutCommunityInputSchema),z.lazy(() => RoomGroupUncheckedUpdateWithoutCommunityInputSchema) ]),
  create: z.union([ z.lazy(() => RoomGroupCreateWithoutCommunityInputSchema),z.lazy(() => RoomGroupUncheckedCreateWithoutCommunityInputSchema) ]),
}).strict();

export default RoomGroupUpsertWithWhereUniqueWithoutCommunityInputSchema;
