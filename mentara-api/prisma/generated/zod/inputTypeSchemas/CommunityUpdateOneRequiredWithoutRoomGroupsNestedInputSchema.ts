import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateWithoutRoomGroupsInputSchema } from './CommunityCreateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedCreateWithoutRoomGroupsInputSchema } from './CommunityUncheckedCreateWithoutRoomGroupsInputSchema';
import { CommunityCreateOrConnectWithoutRoomGroupsInputSchema } from './CommunityCreateOrConnectWithoutRoomGroupsInputSchema';
import { CommunityUpsertWithoutRoomGroupsInputSchema } from './CommunityUpsertWithoutRoomGroupsInputSchema';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';
import { CommunityUpdateToOneWithWhereWithoutRoomGroupsInputSchema } from './CommunityUpdateToOneWithWhereWithoutRoomGroupsInputSchema';
import { CommunityUpdateWithoutRoomGroupsInputSchema } from './CommunityUpdateWithoutRoomGroupsInputSchema';
import { CommunityUncheckedUpdateWithoutRoomGroupsInputSchema } from './CommunityUncheckedUpdateWithoutRoomGroupsInputSchema';

export const CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema: z.ZodType<Prisma.CommunityUpdateOneRequiredWithoutRoomGroupsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommunityCreateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutRoomGroupsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommunityCreateOrConnectWithoutRoomGroupsInputSchema).optional(),
  upsert: z.lazy(() => CommunityUpsertWithoutRoomGroupsInputSchema).optional(),
  connect: z.lazy(() => CommunityWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommunityUpdateToOneWithWhereWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUpdateWithoutRoomGroupsInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutRoomGroupsInputSchema) ]).optional(),
}).strict();

export default CommunityUpdateOneRequiredWithoutRoomGroupsNestedInputSchema;
