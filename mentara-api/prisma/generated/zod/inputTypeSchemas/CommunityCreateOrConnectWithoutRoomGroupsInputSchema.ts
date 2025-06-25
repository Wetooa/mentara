import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';
import { CommunityCreateWithoutRoomGroupsInputSchema } from './CommunityCreateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedCreateWithoutRoomGroupsInputSchema } from './CommunityUncheckedCreateWithoutRoomGroupsInputSchema';

export const CommunityCreateOrConnectWithoutRoomGroupsInputSchema: z.ZodType<Prisma.CommunityCreateOrConnectWithoutRoomGroupsInput> = z.object({
  where: z.lazy(() => CommunityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommunityCreateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutRoomGroupsInputSchema) ]),
}).strict();

export default CommunityCreateOrConnectWithoutRoomGroupsInputSchema;
