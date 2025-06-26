import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutBlockingInputSchema } from './UserCreateWithoutBlockingInputSchema';
import { UserUncheckedCreateWithoutBlockingInputSchema } from './UserUncheckedCreateWithoutBlockingInputSchema';
import { UserCreateOrConnectWithoutBlockingInputSchema } from './UserCreateOrConnectWithoutBlockingInputSchema';
import { UserUpsertWithoutBlockingInputSchema } from './UserUpsertWithoutBlockingInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutBlockingInputSchema } from './UserUpdateToOneWithWhereWithoutBlockingInputSchema';
import { UserUpdateWithoutBlockingInputSchema } from './UserUpdateWithoutBlockingInputSchema';
import { UserUncheckedUpdateWithoutBlockingInputSchema } from './UserUncheckedUpdateWithoutBlockingInputSchema';

export const UserUpdateOneRequiredWithoutBlockingNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBlockingNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockingInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBlockingInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBlockingInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBlockingInputSchema),z.lazy(() => UserUpdateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlockingInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutBlockingNestedInputSchema;
