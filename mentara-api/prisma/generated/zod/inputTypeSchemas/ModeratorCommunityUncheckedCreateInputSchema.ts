import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityUncheckedCreateInputSchema: z.ZodType<Prisma.ModeratorCommunityUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  moderatorId: z.string(),
  communityId: z.string(),
  assignedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCommunityUncheckedCreateInputSchema;
