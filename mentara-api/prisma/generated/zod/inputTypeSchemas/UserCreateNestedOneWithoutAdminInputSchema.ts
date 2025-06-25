import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutAdminInputSchema } from './UserCreateWithoutAdminInputSchema';
import { UserUncheckedCreateWithoutAdminInputSchema } from './UserUncheckedCreateWithoutAdminInputSchema';
import { UserCreateOrConnectWithoutAdminInputSchema } from './UserCreateOrConnectWithoutAdminInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutAdminInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAdminInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAdminInputSchema),z.lazy(() => UserUncheckedCreateWithoutAdminInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAdminInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutAdminInputSchema;
