import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MembershipOrderByRelationAggregateInputSchema } from './MembershipOrderByRelationAggregateInputSchema';
import { ModeratorCommunityOrderByRelationAggregateInputSchema } from './ModeratorCommunityOrderByRelationAggregateInputSchema';
import { RoomGroupOrderByRelationAggregateInputSchema } from './RoomGroupOrderByRelationAggregateInputSchema';

export const CommunityOrderByWithRelationInputSchema: z.ZodType<Prisma.CommunityOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  memberships: z.lazy(() => MembershipOrderByRelationAggregateInputSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityOrderByRelationAggregateInputSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupOrderByRelationAggregateInputSchema).optional()
}).strict();

export default CommunityOrderByWithRelationInputSchema;
