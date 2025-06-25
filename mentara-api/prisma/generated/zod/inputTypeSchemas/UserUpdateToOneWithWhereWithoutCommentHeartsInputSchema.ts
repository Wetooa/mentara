import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutCommentHeartsInputSchema } from './UserUpdateWithoutCommentHeartsInputSchema';
import { UserUncheckedUpdateWithoutCommentHeartsInputSchema } from './UserUncheckedUpdateWithoutCommentHeartsInputSchema';

export const UserUpdateToOneWithWhereWithoutCommentHeartsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCommentHeartsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCommentHeartsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutCommentHeartsInputSchema;
