import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutMessageReactionsInputSchema } from './UserCreateWithoutMessageReactionsInputSchema';
import { UserUncheckedCreateWithoutMessageReactionsInputSchema } from './UserUncheckedCreateWithoutMessageReactionsInputSchema';

export const UserCreateOrConnectWithoutMessageReactionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMessageReactionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReactionsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutMessageReactionsInputSchema;
