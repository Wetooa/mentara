import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutBlockedByInputSchema } from './UserUpdateWithoutBlockedByInputSchema';
import { UserUncheckedUpdateWithoutBlockedByInputSchema } from './UserUncheckedUpdateWithoutBlockedByInputSchema';
import { UserCreateWithoutBlockedByInputSchema } from './UserCreateWithoutBlockedByInputSchema';
import { UserUncheckedCreateWithoutBlockedByInputSchema } from './UserUncheckedCreateWithoutBlockedByInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutBlockedByInputSchema: z.ZodType<Prisma.UserUpsertWithoutBlockedByInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlockedByInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockedByInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutBlockedByInputSchema;
