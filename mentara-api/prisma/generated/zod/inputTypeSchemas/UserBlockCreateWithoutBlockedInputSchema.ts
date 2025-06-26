import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutBlockingInputSchema } from './UserCreateNestedOneWithoutBlockingInputSchema';

export const UserBlockCreateWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockCreateWithoutBlockedInput> = z.object({
  id: z.string().uuid().optional(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  blocker: z.lazy(() => UserCreateNestedOneWithoutBlockingInputSchema)
}).strict();

export default UserBlockCreateWithoutBlockedInputSchema;
