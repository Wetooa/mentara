import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutAdminInputSchema } from './UserUpdateWithoutAdminInputSchema';
import { UserUncheckedUpdateWithoutAdminInputSchema } from './UserUncheckedUpdateWithoutAdminInputSchema';

export const UserUpdateToOneWithWhereWithoutAdminInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAdminInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAdminInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAdminInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutAdminInputSchema;
