import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutCommentHeartsInputSchema } from './UserUpdateWithoutCommentHeartsInputSchema';
import { UserUncheckedUpdateWithoutCommentHeartsInputSchema } from './UserUncheckedUpdateWithoutCommentHeartsInputSchema';
import { UserCreateWithoutCommentHeartsInputSchema } from './UserCreateWithoutCommentHeartsInputSchema';
import { UserUncheckedCreateWithoutCommentHeartsInputSchema } from './UserUncheckedCreateWithoutCommentHeartsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutCommentHeartsInputSchema: z.ZodType<Prisma.UserUpsertWithoutCommentHeartsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCommentHeartsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentHeartsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutCommentHeartsInputSchema;
