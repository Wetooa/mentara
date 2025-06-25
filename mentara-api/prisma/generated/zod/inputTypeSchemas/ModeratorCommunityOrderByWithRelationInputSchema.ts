import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ModeratorOrderByWithRelationInputSchema } from './ModeratorOrderByWithRelationInputSchema';
import { CommunityOrderByWithRelationInputSchema } from './CommunityOrderByWithRelationInputSchema';

export const ModeratorCommunityOrderByWithRelationInputSchema: z.ZodType<Prisma.ModeratorCommunityOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  moderatorId: z.lazy(() => SortOrderSchema).optional(),
  communityId: z.lazy(() => SortOrderSchema).optional(),
  assignedAt: z.lazy(() => SortOrderSchema).optional(),
  moderator: z.lazy(() => ModeratorOrderByWithRelationInputSchema).optional(),
  community: z.lazy(() => CommunityOrderByWithRelationInputSchema).optional()
}).strict();

export default ModeratorCommunityOrderByWithRelationInputSchema;
