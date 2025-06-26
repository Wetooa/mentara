import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutRepliesInputSchema } from './UserCreateWithoutRepliesInputSchema';
import { UserUncheckedCreateWithoutRepliesInputSchema } from './UserUncheckedCreateWithoutRepliesInputSchema';

export const UserCreateOrConnectWithoutRepliesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRepliesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRepliesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutRepliesInputSchema;
