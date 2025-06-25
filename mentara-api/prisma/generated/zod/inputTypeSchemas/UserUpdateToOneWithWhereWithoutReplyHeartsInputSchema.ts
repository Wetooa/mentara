import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutReplyHeartsInputSchema } from './UserUpdateWithoutReplyHeartsInputSchema';
import { UserUncheckedUpdateWithoutReplyHeartsInputSchema } from './UserUncheckedUpdateWithoutReplyHeartsInputSchema';

export const UserUpdateToOneWithWhereWithoutReplyHeartsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutReplyHeartsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReplyHeartsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutReplyHeartsInputSchema;
