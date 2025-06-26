import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutMessageReadReceiptsInputSchema } from './UserCreateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedCreateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedCreateWithoutMessageReadReceiptsInputSchema';

export const UserCreateOrConnectWithoutMessageReadReceiptsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMessageReadReceiptsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMessageReadReceiptsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutMessageReadReceiptsInputSchema;
