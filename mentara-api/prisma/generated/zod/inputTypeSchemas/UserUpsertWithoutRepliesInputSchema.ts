import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutRepliesInputSchema } from './UserUpdateWithoutRepliesInputSchema';
import { UserUncheckedUpdateWithoutRepliesInputSchema } from './UserUncheckedUpdateWithoutRepliesInputSchema';
import { UserCreateWithoutRepliesInputSchema } from './UserCreateWithoutRepliesInputSchema';
import { UserUncheckedCreateWithoutRepliesInputSchema } from './UserUncheckedCreateWithoutRepliesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutRepliesInputSchema: z.ZodType<Prisma.UserUpsertWithoutRepliesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRepliesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRepliesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutRepliesInputSchema;
