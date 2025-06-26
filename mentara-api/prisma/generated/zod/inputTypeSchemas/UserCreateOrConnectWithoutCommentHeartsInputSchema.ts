import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutCommentHeartsInputSchema } from './UserCreateWithoutCommentHeartsInputSchema';
import { UserUncheckedCreateWithoutCommentHeartsInputSchema } from './UserUncheckedCreateWithoutCommentHeartsInputSchema';

export const UserCreateOrConnectWithoutCommentHeartsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCommentHeartsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCommentHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCommentHeartsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutCommentHeartsInputSchema;
