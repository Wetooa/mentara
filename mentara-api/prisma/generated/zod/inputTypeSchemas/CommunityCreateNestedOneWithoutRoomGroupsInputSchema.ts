import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateWithoutRoomGroupsInputSchema } from './CommunityCreateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedCreateWithoutRoomGroupsInputSchema } from './CommunityUncheckedCreateWithoutRoomGroupsInputSchema';
import { CommunityCreateOrConnectWithoutRoomGroupsInputSchema } from './CommunityCreateOrConnectWithoutRoomGroupsInputSchema';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';

export const CommunityCreateNestedOneWithoutRoomGroupsInputSchema: z.ZodType<Prisma.CommunityCreateNestedOneWithoutRoomGroupsInput> = z.object({
  create: z.union([ z.lazy(() => CommunityCreateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutRoomGroupsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommunityCreateOrConnectWithoutRoomGroupsInputSchema).optional(),
  connect: z.lazy(() => CommunityWhereUniqueInputSchema).optional()
}).strict();

export default CommunityCreateNestedOneWithoutRoomGroupsInputSchema;
