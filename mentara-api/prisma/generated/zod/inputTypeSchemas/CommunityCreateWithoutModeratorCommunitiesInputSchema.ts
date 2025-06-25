import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipCreateNestedManyWithoutCommunityInputSchema } from './MembershipCreateNestedManyWithoutCommunityInputSchema';
import { RoomGroupCreateNestedManyWithoutCommunityInputSchema } from './RoomGroupCreateNestedManyWithoutCommunityInputSchema';

export const CommunityCreateWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.CommunityCreateWithoutModeratorCommunitiesInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  memberships: z.lazy(() => MembershipCreateNestedManyWithoutCommunityInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupCreateNestedManyWithoutCommunityInputSchema).optional()
}).strict();

export default CommunityCreateWithoutModeratorCommunitiesInputSchema;
