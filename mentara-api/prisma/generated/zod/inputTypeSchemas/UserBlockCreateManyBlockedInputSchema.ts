import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const UserBlockCreateManyBlockedInputSchema: z.ZodType<Prisma.UserBlockCreateManyBlockedInput> = z.object({
  id: z.string().uuid().optional(),
  blockerId: z.string(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default UserBlockCreateManyBlockedInputSchema;
