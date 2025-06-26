import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityUncheckedCreateWithoutCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  moderatorId: z.string(),
  assignedAt: z.coerce.date().optional()
}).strict();

export default ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema;
