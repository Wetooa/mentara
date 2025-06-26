import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutMessageReadReceiptsInputSchema } from './UserCreateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedCreateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedCreateWithoutMessageReadReceiptsInputSchema';
import { UserCreateOrConnectWithoutMessageReadReceiptsInputSchema } from './UserCreateOrConnectWithoutMessageReadReceiptsInputSchema';
import { UserUpsertWithoutMessageReadReceiptsInputSchema } from './UserUpsertWithoutMessageReadReceiptsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutMessageReadReceiptsInputSchema } from './UserUpdateToOneWithWhereWithoutMessageReadReceiptsInputSchema';
import { UserUpdateWithoutMessageReadReceiptsInputSchema } from './UserUpdateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema';

export const UserUpdateOneRequiredWithoutMessageReadReceiptsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutMessageReadReceiptsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReadReceiptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMessageReadReceiptsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutMessageReadReceiptsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUpdateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutMessageReadReceiptsNestedInputSchema;
