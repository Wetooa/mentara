import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutBlockedByInputSchema } from './UserUpdateWithoutBlockedByInputSchema';
import { UserUncheckedUpdateWithoutBlockedByInputSchema } from './UserUncheckedUpdateWithoutBlockedByInputSchema';

export const UserUpdateToOneWithWhereWithoutBlockedByInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBlockedByInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlockedByInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutBlockedByInputSchema;
