import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutModeratorInputSchema } from './UserCreateWithoutModeratorInputSchema';
import { UserUncheckedCreateWithoutModeratorInputSchema } from './UserUncheckedCreateWithoutModeratorInputSchema';
import { UserCreateOrConnectWithoutModeratorInputSchema } from './UserCreateOrConnectWithoutModeratorInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutModeratorInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutModeratorInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedCreateWithoutModeratorInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutModeratorInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutModeratorInputSchema;
