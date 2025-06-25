import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema';
import { RoomGroupUncheckedCreateNestedManyWithoutCommunityInputSchema } from './RoomGroupUncheckedCreateNestedManyWithoutCommunityInputSchema';

export const CommunityUncheckedCreateWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityUncheckedCreateWithoutMembershipsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupUncheckedCreateNestedManyWithoutCommunityInputSchema).optional()
}).strict();

export default CommunityUncheckedCreateWithoutMembershipsInputSchema;
