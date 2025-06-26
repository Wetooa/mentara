import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const UserBlockUncheckedCreateWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockUncheckedCreateWithoutBlockedInput> = z.object({
  id: z.string().uuid().optional(),
  blockerId: z.string(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default UserBlockUncheckedCreateWithoutBlockedInputSchema;
