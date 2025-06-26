import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupScalarWhereInputSchema } from './RoomGroupScalarWhereInputSchema';
import { RoomGroupUpdateManyMutationInputSchema } from './RoomGroupUpdateManyMutationInputSchema';
import { RoomGroupUncheckedUpdateManyWithoutCommunityInputSchema } from './RoomGroupUncheckedUpdateManyWithoutCommunityInputSchema';

export const RoomGroupUpdateManyWithWhereWithoutCommunityInputSchema: z.ZodType<Prisma.RoomGroupUpdateManyWithWhereWithoutCommunityInput> = z.object({
  where: z.lazy(() => RoomGroupScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RoomGroupUpdateManyMutationInputSchema),z.lazy(() => RoomGroupUncheckedUpdateManyWithoutCommunityInputSchema) ]),
}).strict();

export default RoomGroupUpdateManyWithWhereWithoutCommunityInputSchema;
