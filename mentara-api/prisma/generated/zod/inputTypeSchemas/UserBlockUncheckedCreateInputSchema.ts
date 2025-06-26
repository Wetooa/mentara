import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const UserBlockUncheckedCreateInputSchema: z.ZodType<Prisma.UserBlockUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  blockerId: z.string(),
  blockedId: z.string(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default UserBlockUncheckedCreateInputSchema;
