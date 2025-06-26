import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutMessageReactionsInputSchema } from './UserUpdateWithoutMessageReactionsInputSchema';
import { UserUncheckedUpdateWithoutMessageReactionsInputSchema } from './UserUncheckedUpdateWithoutMessageReactionsInputSchema';
import { UserCreateWithoutMessageReactionsInputSchema } from './UserCreateWithoutMessageReactionsInputSchema';
import { UserUncheckedCreateWithoutMessageReactionsInputSchema } from './UserUncheckedCreateWithoutMessageReactionsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutMessageReactionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutMessageReactionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMessageReactionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReactionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutMessageReactionsInputSchema;
