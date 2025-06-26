import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityCreateManyInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  moderatorId: z.string(),
  communityId: z.string(),
  assignedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCommunityCreateManyInputSchema;
