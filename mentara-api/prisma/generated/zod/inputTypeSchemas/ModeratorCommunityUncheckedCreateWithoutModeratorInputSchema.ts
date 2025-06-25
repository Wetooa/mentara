import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityUncheckedCreateWithoutModeratorInput> = z.object({
  id: z.string().uuid().optional(),
  communityId: z.string(),
  assignedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema;
