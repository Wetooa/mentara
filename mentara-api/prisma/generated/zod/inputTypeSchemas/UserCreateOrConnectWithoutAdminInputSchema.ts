import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutAdminInputSchema } from './UserCreateWithoutAdminInputSchema';
import { UserUncheckedCreateWithoutAdminInputSchema } from './UserUncheckedCreateWithoutAdminInputSchema';

export const UserCreateOrConnectWithoutAdminInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAdminInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAdminInputSchema),z.lazy(() => UserUncheckedCreateWithoutAdminInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutAdminInputSchema;
