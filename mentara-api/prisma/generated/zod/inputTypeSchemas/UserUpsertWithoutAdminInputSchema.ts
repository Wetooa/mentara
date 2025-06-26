import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutAdminInputSchema } from './UserUpdateWithoutAdminInputSchema';
import { UserUncheckedUpdateWithoutAdminInputSchema } from './UserUncheckedUpdateWithoutAdminInputSchema';
import { UserCreateWithoutAdminInputSchema } from './UserCreateWithoutAdminInputSchema';
import { UserUncheckedCreateWithoutAdminInputSchema } from './UserUncheckedCreateWithoutAdminInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutAdminInputSchema: z.ZodType<Prisma.UserUpsertWithoutAdminInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAdminInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAdminInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAdminInputSchema),z.lazy(() => UserUncheckedCreateWithoutAdminInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutAdminInputSchema;
