import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutBlockingInputSchema } from './UserCreateWithoutBlockingInputSchema';
import { UserUncheckedCreateWithoutBlockingInputSchema } from './UserUncheckedCreateWithoutBlockingInputSchema';

export const UserCreateOrConnectWithoutBlockingInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBlockingInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockingInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutBlockingInputSchema;
