import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityCreateManyCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  moderatorId: z.string(),
  assignedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCommunityCreateManyCommunityInputSchema;
