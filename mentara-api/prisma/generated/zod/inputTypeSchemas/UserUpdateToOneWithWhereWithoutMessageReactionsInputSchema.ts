import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutMessageReactionsInputSchema } from './UserUpdateWithoutMessageReactionsInputSchema';
import { UserUncheckedUpdateWithoutMessageReactionsInputSchema } from './UserUncheckedUpdateWithoutMessageReactionsInputSchema';

export const UserUpdateToOneWithWhereWithoutMessageReactionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMessageReactionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMessageReactionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMessageReactionsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutMessageReactionsInputSchema;
