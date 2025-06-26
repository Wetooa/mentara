import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema } from './MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema';

export const CommunityUncheckedCreateWithoutRoomGroupsInputSchema: z.ZodType<Prisma.CommunityUncheckedCreateWithoutRoomGroupsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  memberships: z.lazy(() => MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityUncheckedCreateNestedManyWithoutCommunityInputSchema).optional()
}).strict();

export default CommunityUncheckedCreateWithoutRoomGroupsInputSchema;
