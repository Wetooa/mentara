import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const UserBlockUncheckedCreateWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockUncheckedCreateWithoutBlockerInput> = z.object({
  id: z.string().uuid().optional(),
  blockedId: z.string(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default UserBlockUncheckedCreateWithoutBlockerInputSchema;
