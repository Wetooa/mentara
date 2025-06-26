import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutMessageReactionsInputSchema } from './UserCreateWithoutMessageReactionsInputSchema';
import { UserUncheckedCreateWithoutMessageReactionsInputSchema } from './UserUncheckedCreateWithoutMessageReactionsInputSchema';
import { UserCreateOrConnectWithoutMessageReactionsInputSchema } from './UserCreateOrConnectWithoutMessageReactionsInputSchema';
import { UserUpsertWithoutMessageReactionsInputSchema } from './UserUpsertWithoutMessageReactionsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutMessageReactionsInputSchema } from './UserUpdateToOneWithWhereWithoutMessageReactionsInputSchema';
import { UserUpdateWithoutMessageReactionsInputSchema } from './UserUpdateWithoutMessageReactionsInputSchema';
import { UserUncheckedUpdateWithoutMessageReactionsInputSchema } from './UserUncheckedUpdateWithoutMessageReactionsInputSchema';

export const UserUpdateOneRequiredWithoutMessageReactionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutMessageReactionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReactionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMessageReactionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutMessageReactionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutMessageReactionsInputSchema),z.lazy(() => UserUpdateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMessageReactionsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutMessageReactionsNestedInputSchema;
