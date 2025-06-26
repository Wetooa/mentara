import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutConversationsInputSchema } from './UserUpdateWithoutConversationsInputSchema';
import { UserUncheckedUpdateWithoutConversationsInputSchema } from './UserUncheckedUpdateWithoutConversationsInputSchema';
import { UserCreateWithoutConversationsInputSchema } from './UserCreateWithoutConversationsInputSchema';
import { UserUncheckedCreateWithoutConversationsInputSchema } from './UserUncheckedCreateWithoutConversationsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutConversationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutConversationsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutConversationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutConversationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutConversationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutConversationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutConversationsInputSchema;
