import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema } from './MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema';
import { RoomGroupUncheckedCreateNestedManyWithoutCommunityInputSchema } from './RoomGroupUncheckedCreateNestedManyWithoutCommunityInputSchema';

export const CommunityUncheckedCreateInputSchema: z.ZodType<Prisma.CommunityUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  memberships: z.lazy(() => MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupUncheckedCreateNestedManyWithoutCommunityInputSchema).optional()
}).strict();

export default CommunityUncheckedCreateInputSchema;
