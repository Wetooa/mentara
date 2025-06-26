import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutClientInputSchema } from './UserUpdateWithoutClientInputSchema';
import { UserUncheckedUpdateWithoutClientInputSchema } from './UserUncheckedUpdateWithoutClientInputSchema';

export const UserUpdateToOneWithWhereWithoutClientInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutClientInputSchema),z.lazy(() => UserUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutClientInputSchema;
