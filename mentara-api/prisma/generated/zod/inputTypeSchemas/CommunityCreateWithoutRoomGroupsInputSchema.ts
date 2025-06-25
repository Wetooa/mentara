import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipCreateNestedManyWithoutCommunityInputSchema } from './MembershipCreateNestedManyWithoutCommunityInputSchema';
import { ModeratorCommunityCreateNestedManyWithoutCommunityInputSchema } from './ModeratorCommunityCreateNestedManyWithoutCommunityInputSchema';

export const CommunityCreateWithoutRoomGroupsInputSchema: z.ZodType<Prisma.CommunityCreateWithoutRoomGroupsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  memberships: z.lazy(() => MembershipCreateNestedManyWithoutCommunityInputSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityCreateNestedManyWithoutCommunityInputSchema).optional()
}).strict();

export default CommunityCreateWithoutRoomGroupsInputSchema;
