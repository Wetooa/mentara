import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutReplyHeartsInputSchema } from './UserCreateWithoutReplyHeartsInputSchema';
import { UserUncheckedCreateWithoutReplyHeartsInputSchema } from './UserUncheckedCreateWithoutReplyHeartsInputSchema';
import { UserCreateOrConnectWithoutReplyHeartsInputSchema } from './UserCreateOrConnectWithoutReplyHeartsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutReplyHeartsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReplyHeartsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutReplyHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReplyHeartsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutReplyHeartsInputSchema;
