import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutAdminInputSchema } from './UserCreateWithoutAdminInputSchema';
import { UserUncheckedCreateWithoutAdminInputSchema } from './UserUncheckedCreateWithoutAdminInputSchema';
import { UserCreateOrConnectWithoutAdminInputSchema } from './UserCreateOrConnectWithoutAdminInputSchema';
import { UserUpsertWithoutAdminInputSchema } from './UserUpsertWithoutAdminInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutAdminInputSchema } from './UserUpdateToOneWithWhereWithoutAdminInputSchema';
import { UserUpdateWithoutAdminInputSchema } from './UserUpdateWithoutAdminInputSchema';
import { UserUncheckedUpdateWithoutAdminInputSchema } from './UserUncheckedUpdateWithoutAdminInputSchema';

export const UserUpdateOneRequiredWithoutAdminNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutAdminNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAdminInputSchema),z.lazy(() => UserUncheckedCreateWithoutAdminInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAdminInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAdminInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAdminInputSchema),z.lazy(() => UserUpdateWithoutAdminInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAdminInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutAdminNestedInputSchema;
