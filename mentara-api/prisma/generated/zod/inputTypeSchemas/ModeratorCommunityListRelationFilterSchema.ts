import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereInputSchema } from './ModeratorCommunityWhereInputSchema';

export const ModeratorCommunityListRelationFilterSchema: z.ZodType<Prisma.ModeratorCommunityListRelationFilter> = z.object({
  every: z.lazy(() => ModeratorCommunityWhereInputSchema).optional(),
  some: z.lazy(() => ModeratorCommunityWhereInputSchema).optional(),
  none: z.lazy(() => ModeratorCommunityWhereInputSchema).optional()
}).strict();

export default ModeratorCommunityListRelationFilterSchema;
