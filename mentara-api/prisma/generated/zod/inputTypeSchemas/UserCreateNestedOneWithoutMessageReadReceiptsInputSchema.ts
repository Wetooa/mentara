import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutMessageReadReceiptsInputSchema } from './UserCreateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedCreateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedCreateWithoutMessageReadReceiptsInputSchema';
import { UserCreateOrConnectWithoutMessageReadReceiptsInputSchema } from './UserCreateOrConnectWithoutMessageReadReceiptsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutMessageReadReceiptsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMessageReadReceiptsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReadReceiptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMessageReadReceiptsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutMessageReadReceiptsInputSchema;
