import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutBlockedByInputSchema } from './UserCreateNestedOneWithoutBlockedByInputSchema';

export const UserBlockCreateWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockCreateWithoutBlockerInput> = z.object({
  id: z.string().uuid().optional(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  blocked: z.lazy(() => UserCreateNestedOneWithoutBlockedByInputSchema)
}).strict();

export default UserBlockCreateWithoutBlockerInputSchema;
