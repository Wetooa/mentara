import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const ModeratorCommunityScalarWhereInputSchema: z.ZodType<Prisma.ModeratorCommunityScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ModeratorCommunityScalarWhereInputSchema),z.lazy(() => ModeratorCommunityScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ModeratorCommunityScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ModeratorCommunityScalarWhereInputSchema),z.lazy(() => ModeratorCommunityScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  moderatorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  communityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ModeratorCommunityScalarWhereInputSchema;
