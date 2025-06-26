import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutModeratorInputSchema } from './UserUpdateWithoutModeratorInputSchema';
import { UserUncheckedUpdateWithoutModeratorInputSchema } from './UserUncheckedUpdateWithoutModeratorInputSchema';
import { UserCreateWithoutModeratorInputSchema } from './UserCreateWithoutModeratorInputSchema';
import { UserUncheckedCreateWithoutModeratorInputSchema } from './UserUncheckedCreateWithoutModeratorInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutModeratorInputSchema: z.ZodType<Prisma.UserUpsertWithoutModeratorInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedUpdateWithoutModeratorInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedCreateWithoutModeratorInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutModeratorInputSchema;
