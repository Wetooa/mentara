import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutMessageReactionsInputSchema } from './UserCreateWithoutMessageReactionsInputSchema';
import { UserUncheckedCreateWithoutMessageReactionsInputSchema } from './UserUncheckedCreateWithoutMessageReactionsInputSchema';
import { UserCreateOrConnectWithoutMessageReactionsInputSchema } from './UserCreateOrConnectWithoutMessageReactionsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutMessageReactionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMessageReactionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReactionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMessageReactionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutMessageReactionsInputSchema;
