import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutModeratorInputSchema } from './UserUpdateWithoutModeratorInputSchema';
import { UserUncheckedUpdateWithoutModeratorInputSchema } from './UserUncheckedUpdateWithoutModeratorInputSchema';

export const UserUpdateToOneWithWhereWithoutModeratorInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutModeratorInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedUpdateWithoutModeratorInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutModeratorInputSchema;
