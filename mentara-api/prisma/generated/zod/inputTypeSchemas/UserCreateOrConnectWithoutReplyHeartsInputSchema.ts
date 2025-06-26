import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutReplyHeartsInputSchema } from './UserCreateWithoutReplyHeartsInputSchema';
import { UserUncheckedCreateWithoutReplyHeartsInputSchema } from './UserUncheckedCreateWithoutReplyHeartsInputSchema';

export const UserCreateOrConnectWithoutReplyHeartsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutReplyHeartsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutReplyHeartsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutReplyHeartsInputSchema;
