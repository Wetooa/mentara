import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutRepliesInputSchema } from './UserCreateWithoutRepliesInputSchema';
import { UserUncheckedCreateWithoutRepliesInputSchema } from './UserUncheckedCreateWithoutRepliesInputSchema';
import { UserCreateOrConnectWithoutRepliesInputSchema } from './UserCreateOrConnectWithoutRepliesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutRepliesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutRepliesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRepliesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutRepliesInputSchema;
