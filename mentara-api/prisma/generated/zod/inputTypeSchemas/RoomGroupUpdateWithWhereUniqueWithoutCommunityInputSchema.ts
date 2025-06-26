import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereUniqueInputSchema } from './RoomGroupWhereUniqueInputSchema';
import { RoomGroupUpdateWithoutCommunityInputSchema } from './RoomGroupUpdateWithoutCommunityInputSchema';
import { RoomGroupUncheckedUpdateWithoutCommunityInputSchema } from './RoomGroupUncheckedUpdateWithoutCommunityInputSchema';

export const RoomGroupUpdateWithWhereUniqueWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupUpdateWithWhereUniqueWithoutCommunityInput> = z.object({
  where: z.lazy(() => RoomGroupWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RoomGroupUpdateWithoutCommunityInputSchema),z.lazy(() => RoomGroupUncheckedUpdateWithoutCommunityInputSchema) ]),
}).strict();

export default RoomGroupUpdateWithWhereUniqueWithoutCommunityInputSchema;
