import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutBlockedByInputSchema } from './UserCreateWithoutBlockedByInputSchema';
import { UserUncheckedCreateWithoutBlockedByInputSchema } from './UserUncheckedCreateWithoutBlockedByInputSchema';
import { UserCreateOrConnectWithoutBlockedByInputSchema } from './UserCreateOrConnectWithoutBlockedByInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutBlockedByInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBlockedByInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockedByInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBlockedByInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutBlockedByInputSchema;
