import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityCreateManyModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyModeratorInput> = z.object({
  id: z.string().uuid().optional(),
  communityId: z.string(),
  assignedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCommunityCreateManyModeratorInputSchema;
