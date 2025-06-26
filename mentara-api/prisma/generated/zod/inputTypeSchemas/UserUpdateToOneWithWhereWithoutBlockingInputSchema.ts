import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutBlockingInputSchema } from './UserUpdateWithoutBlockingInputSchema';
import { UserUncheckedUpdateWithoutBlockingInputSchema } from './UserUncheckedUpdateWithoutBlockingInputSchema';

export const UserUpdateToOneWithWhereWithoutBlockingInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBlockingInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlockingInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutBlockingInputSchema;
