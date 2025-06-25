import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutModeratorInputSchema } from './UserCreateWithoutModeratorInputSchema';
import { UserUncheckedCreateWithoutModeratorInputSchema } from './UserUncheckedCreateWithoutModeratorInputSchema';

export const UserCreateOrConnectWithoutModeratorInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutModeratorInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedCreateWithoutModeratorInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutModeratorInputSchema;
