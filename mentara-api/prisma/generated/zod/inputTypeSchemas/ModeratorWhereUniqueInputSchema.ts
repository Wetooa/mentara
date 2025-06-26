import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ModeratorCommunityListRelationFilterSchema } from './ModeratorCommunityListRelationFilterSchema';

export const ModeratorWhereUniqueInputSchema: z.ZodType<Prisma.ModeratorWhereUniqueInput> = z.object({
  userId: z.string()
})
.and(z.object({
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => ModeratorWhereInputSchema),z.lazy(() => ModeratorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ModeratorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ModeratorWhereInputSchema),z.lazy(() => ModeratorWhereInputSchema).array() ]).optional(),
  permissions: z.lazy(() => StringNullableListFilterSchema).optional(),
  assignedCommunities: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  moderatorCommunities: z.lazy(() => ModeratorCommunityListRelationFilterSchema).optional()
}).strict());

export default ModeratorWhereUniqueInputSchema;
