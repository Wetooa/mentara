import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityUpdateWithoutRoomGroupsInputSchema } from './CommunityUpdateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedUpdateWithoutRoomGroupsInputSchema } from './CommunityUncheckedUpdateWithoutRoomGroupsInputSchema';
import { CommunityCreateWithoutRoomGroupsInputSchema } from './CommunityCreateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedCreateWithoutRoomGroupsInputSchema } from './CommunityUncheckedCreateWithoutRoomGroupsInputSchema';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';

export const CommunityUpsertWithoutRoomGroupsInputSchema: z.ZodType<Prisma.CommunityUpsertWithoutRoomGroupsInput> = z.object({
  update: z.union([ z.lazy(() => CommunityUpdateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutRoomGroupsInputSchema) ]),
  create: z.union([ z.lazy(() => CommunityCreateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutRoomGroupsInputSchema) ]),
  where: z.lazy(() => CommunityWhereInputSchema).optional()
}).strict();

export default CommunityUpsertWithoutRoomGroupsInputSchema;
