import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutClientInputSchema } from './UserUpdateWithoutClientInputSchema';
import { UserUncheckedUpdateWithoutClientInputSchema } from './UserUncheckedUpdateWithoutClientInputSchema';
import { UserCreateWithoutClientInputSchema } from './UserCreateWithoutClientInputSchema';
import { UserUncheckedCreateWithoutClientInputSchema } from './UserUncheckedCreateWithoutClientInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutClientInputSchema: z.ZodType<Prisma.UserUpsertWithoutClientInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutClientInputSchema),z.lazy(() => UserUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutClientInputSchema),z.lazy(() => UserUncheckedCreateWithoutClientInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutClientInputSchema;
