import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MembershipUserIdCommunityIdCompoundUniqueInputSchema: z.ZodType<Prisma.MembershipUserIdCommunityIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  communityId: z.string()
}).strict();

export default MembershipUserIdCommunityIdCompoundUniqueInputSchema;
