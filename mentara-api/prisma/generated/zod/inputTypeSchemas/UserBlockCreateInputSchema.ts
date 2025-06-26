import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutBlockingInputSchema } from './UserCreateNestedOneWithoutBlockingInputSchema';
import { UserCreateNestedOneWithoutBlockedByInputSchema } from './UserCreateNestedOneWithoutBlockedByInputSchema';

export const UserBlockCreateInputSchema: z.ZodType<Prisma.UserBlockCreateInput> = z.object({
  id: z.string().uuid().optional(),
  reason: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  blocker: z.lazy(() => UserCreateNestedOneWithoutBlockingInputSchema),
  blocked: z.lazy(() => UserCreateNestedOneWithoutBlockedByInputSchema)
}).strict();

export default UserBlockCreateInputSchema;
