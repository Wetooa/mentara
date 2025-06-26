import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutConversationsInputSchema } from './UserCreateWithoutConversationsInputSchema';
import { UserUncheckedCreateWithoutConversationsInputSchema } from './UserUncheckedCreateWithoutConversationsInputSchema';

export const UserCreateOrConnectWithoutConversationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutConversationsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutConversationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutConversationsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutConversationsInputSchema;
