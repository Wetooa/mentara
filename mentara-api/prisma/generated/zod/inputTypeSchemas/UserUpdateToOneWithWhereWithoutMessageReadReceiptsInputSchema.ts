import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutMessageReadReceiptsInputSchema } from './UserUpdateWithoutMessageReadReceiptsInputSchema';
import { UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema } from './UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema';

export const UserUpdateToOneWithWhereWithoutMessageReadReceiptsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMessageReadReceiptsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMessageReadReceiptsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMessageReadReceiptsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutMessageReadReceiptsInputSchema;
