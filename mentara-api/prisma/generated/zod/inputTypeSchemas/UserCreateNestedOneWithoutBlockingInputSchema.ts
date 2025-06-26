import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutBlockingInputSchema } from './UserCreateWithoutBlockingInputSchema';
import { UserUncheckedCreateWithoutBlockingInputSchema } from './UserUncheckedCreateWithoutBlockingInputSchema';
import { UserCreateOrConnectWithoutBlockingInputSchema } from './UserCreateOrConnectWithoutBlockingInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutBlockingInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBlockingInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockingInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBlockingInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutBlockingInputSchema;
