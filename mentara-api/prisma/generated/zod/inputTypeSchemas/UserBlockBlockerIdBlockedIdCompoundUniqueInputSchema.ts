import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema: z.ZodType<Prisma.UserBlockBlockerIdBlockedIdCompoundUniqueInput> = z.object({
  blockerId: z.string(),
  blockedId: z.string()
}).strict();

export default UserBlockBlockerIdBlockedIdCompoundUniqueInputSchema;
