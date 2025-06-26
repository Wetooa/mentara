import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutRepliesInputSchema } from './UserUpdateWithoutRepliesInputSchema';
import { UserUncheckedUpdateWithoutRepliesInputSchema } from './UserUncheckedUpdateWithoutRepliesInputSchema';

export const UserUpdateToOneWithWhereWithoutRepliesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutRepliesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRepliesInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutRepliesInputSchema;
