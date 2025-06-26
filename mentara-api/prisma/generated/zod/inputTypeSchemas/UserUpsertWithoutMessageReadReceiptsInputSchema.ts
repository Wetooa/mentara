import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutMessageReadReceiptsInputSchema } from './UserUpdateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema';
import { UserCreateWithoutMessageReadReceiptsInputSchema } from './UserCreateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedCreateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedCreateWithoutMessageReadReceiptsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutMessageReadReceiptsInputSchema: z.ZodType<Prisma.UserUpsertWithoutMessageReadReceiptsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReadReceiptsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutMessageReadReceiptsInputSchema;
