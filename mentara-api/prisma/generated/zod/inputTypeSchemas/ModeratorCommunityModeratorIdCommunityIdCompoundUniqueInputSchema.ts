import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema: z.ZodType<Prisma.ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInput> = z.object({
  moderatorId: z.string(),
  communityId: z.string()
}).strict();

export default ModeratorCommunityModeratorIdCommunityIdCompoundUniqueInputSchema;
