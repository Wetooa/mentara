import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutClientInputSchema } from './UserCreateWithoutClientInputSchema';
import { UserUncheckedCreateWithoutClientInputSchema } from './UserUncheckedCreateWithoutClientInputSchema';
import { UserCreateOrConnectWithoutClientInputSchema } from './UserCreateOrConnectWithoutClientInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutClientInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutClientInputSchema),z.lazy(() => UserUncheckedCreateWithoutClientInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutClientInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutClientInputSchema;
