import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutBlockedByInputSchema } from './UserCreateWithoutBlockedByInputSchema';
import { UserUncheckedCreateWithoutBlockedByInputSchema } from './UserUncheckedCreateWithoutBlockedByInputSchema';

export const UserCreateOrConnectWithoutBlockedByInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBlockedByInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockedByInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutBlockedByInputSchema;
