import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateNestedManyWithoutCommunityInputSchema } from './ModeratorCommunityCreateNestedManyWithoutCommunityInputSchema';
import { RoomGroupCreateNestedManyWithoutCommunityInputSchema } from './RoomGroupCreateNestedManyWithoutCommunityInputSchema';

export const CommunityCreateWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityCreateWithoutMembershipsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityCreateNestedManyWithoutCommunityInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupCreateNestedManyWithoutCommunityInputSchema).optional()
}).strict();

export default CommunityCreateWithoutMembershipsInputSchema;
