import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutBlockedByInputSchema } from './UserCreateWithoutBlockedByInputSchema';
import { UserUncheckedCreateWithoutBlockedByInputSchema } from './UserUncheckedCreateWithoutBlockedByInputSchema';
import { UserCreateOrConnectWithoutBlockedByInputSchema } from './UserCreateOrConnectWithoutBlockedByInputSchema';
import { UserUpsertWithoutBlockedByInputSchema } from './UserUpsertWithoutBlockedByInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutBlockedByInputSchema } from './UserUpdateToOneWithWhereWithoutBlockedByInputSchema';
import { UserUpdateWithoutBlockedByInputSchema } from './UserUpdateWithoutBlockedByInputSchema';
import { UserUncheckedUpdateWithoutBlockedByInputSchema } from './UserUncheckedUpdateWithoutBlockedByInputSchema';

export const UserUpdateOneRequiredWithoutBlockedByNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBlockedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockedByInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBlockedByInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBlockedByInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBlockedByInputSchema),z.lazy(() => UserUpdateWithoutBlockedByInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlockedByInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutBlockedByNestedInputSchema;
