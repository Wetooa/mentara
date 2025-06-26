import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutClientInputSchema } from './UserCreateWithoutClientInputSchema';
import { UserUncheckedCreateWithoutClientInputSchema } from './UserUncheckedCreateWithoutClientInputSchema';
import { UserCreateOrConnectWithoutClientInputSchema } from './UserCreateOrConnectWithoutClientInputSchema';
import { UserUpsertWithoutClientInputSchema } from './UserUpsertWithoutClientInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutClientInputSchema } from './UserUpdateToOneWithWhereWithoutClientInputSchema';
import { UserUpdateWithoutClientInputSchema } from './UserUpdateWithoutClientInputSchema';
import { UserUncheckedUpdateWithoutClientInputSchema } from './UserUncheckedUpdateWithoutClientInputSchema';

export const UserUpdateOneRequiredWithoutClientNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutClientInputSchema),z.lazy(() => UserUncheckedCreateWithoutClientInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutClientInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutClientInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutClientInputSchema),z.lazy(() => UserUpdateWithoutClientInputSchema),z.lazy(() => UserUncheckedUpdateWithoutClientInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutClientNestedInputSchema;
