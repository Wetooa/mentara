import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';
import { CommunityUpdateWithoutRoomGroupsInputSchema } from './CommunityUpdateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedUpdateWithoutRoomGroupsInputSchema } from './CommunityUncheckedUpdateWithoutRoomGroupsInputSchema';

export const CommunityUpdateToOneWithWhereWithoutRoomGroupsInputSchema: z.ZodType<Prisma.CommunityUpdateToOneWithWhereWithoutRoomGroupsInput> = z.object({
  where: z.lazy(() => CommunityWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommunityUpdateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutRoomGroupsInputSchema) ]),
}).strict();

export default CommunityUpdateToOneWithWhereWithoutRoomGroupsInputSchema;
