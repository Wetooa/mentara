import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutReplyHeartsInputSchema } from './UserUpdateWithoutReplyHeartsInputSchema';
import { UserUncheckedUpdateWithoutReplyHeartsInputSchema } from './UserUncheckedUpdateWithoutReplyHeartsInputSchema';
import { UserCreateWithoutReplyHeartsInputSchema } from './UserCreateWithoutReplyHeartsInputSchema';
import { UserUncheckedCreateWithoutReplyHeartsInputSchema } from './UserUncheckedCreateWithoutReplyHeartsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutReplyHeartsInputSchema: z.ZodType<Prisma.UserUpsertWithoutReplyHeartsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReplyHeartsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutReplyHeartsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutReplyHeartsInputSchema;
