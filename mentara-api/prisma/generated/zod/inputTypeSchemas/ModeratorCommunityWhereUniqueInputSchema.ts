import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema } from './ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema';
import { ModeratorCommunityWhereInputSchema } from './ModeratorCommunityWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ModeratorScalarRelationFilterSchema } from './ModeratorScalarRelationFilterSchema';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { CommunityScalarRelationFilterSchema } from './CommunityScalarRelationFilterSchema';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';

export const ModeratorCommunityWhereUniqueInputSchema: z.ZodType<Prisma.ModeratorCommunityWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    moderatorId_communityId: z.lazy(() => ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    moderatorId_communityId: z.lazy(() => ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  moderatorId_communityId: z.lazy(() => ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ModeratorCommunityWhereInputSchema),z.lazy(() => ModeratorCommunityWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ModeratorCommunityWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ModeratorCommunityWhereInputSchema),z.lazy(() => ModeratorCommunityWhereInputSchema).array() ]).optional(),
  moderatorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  communityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  moderator: z.union([ z.lazy(() => ModeratorScalarRelationFilterSchema),z.lazy(() => ModeratorWhereInputSchema) ]).optional(),
  community: z.union([ z.lazy(() => CommunityScalarRelationFilterSchema),z.lazy(() => CommunityWhereInputSchema) ]).optional(),
}).strict());

export default ModeratorCommunityWhereUniqueInputSchema;
