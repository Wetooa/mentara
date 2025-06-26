import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutClientInputSchema } from './UserCreateWithoutClientInputSchema';
import { UserUncheckedCreateWithoutClientInputSchema } from './UserUncheckedCreateWithoutClientInputSchema';

export const UserCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutClientInputSchema),z.lazy(() => UserUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutClientInputSchema;
