import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MembershipListRelationFilterSchema } from './MembershipListRelationFilterSchema';
import { ModeratorCommunityListRelationFilterSchema } from './ModeratorCommunityListRelationFilterSchema';
import { RoomGroupListRelationFilterSchema } from './RoomGroupListRelationFilterSchema';

export const CommunityWhereUniqueInputSchema: z.ZodType<Prisma.CommunityWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string()
  }),
  z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  z.object({
    id: z.string().uuid(),
    slug: z.string(),
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    name: z.string(),
    slug: z.string(),
  }),
  z.object({
    name: z.string(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => CommunityWhereInputSchema),z.lazy(() => CommunityWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommunityWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommunityWhereInputSchema),z.lazy(() => CommunityWhereInputSchema).array() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  memberships: z.lazy(() => MembershipListRelationFilterSchema).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityListRelationFilterSchema).optional(),
  roomGroups: z.lazy(() => RoomGroupListRelationFilterSchema).optional()
}).strict());

export default CommunityWhereUniqueInputSchema;
