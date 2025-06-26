import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const UserBlockCreateManyBlockerInputSchema: z.ZodType<Prisma.UserBlockCreateManyBlockerInput> = z.object({
  id: z.string().uuid().optional(),
  blockedId: z.string(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default UserBlockCreateManyBlockerInputSchema;
