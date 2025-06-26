import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ModeratorScalarRelationFilterSchema } from './ModeratorScalarRelationFilterSchema';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { CommunityScalarRelationFilterSchema } from './CommunityScalarRelationFilterSchema';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';

export const ModeratorCommunityWhereInputSchema: z.ZodType<Prisma.ModeratorCommunityWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ModeratorCommunityWhereInputSchema),z.lazy(() => ModeratorCommunityWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ModeratorCommunityWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ModeratorCommunityWhereInputSchema),z.lazy(() => ModeratorCommunityWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  moderatorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  communityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  moderator: z.union([ z.lazy(() => ModeratorScalarRelationFilterSchema),z.lazy(() => ModeratorWhereInputSchema) ]).optional(),
  community: z.union([ z.lazy(() => CommunityScalarRelationFilterSchema),z.lazy(() => CommunityWhereInputSchema) ]).optional(),
}).strict();

export default ModeratorCommunityWhereInputSchema;
