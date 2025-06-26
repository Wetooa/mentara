import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutConversationsInputSchema } from './UserUpdateWithoutConversationsInputSchema';
import { UserUncheckedUpdateWithoutConversationsInputSchema } from './UserUncheckedUpdateWithoutConversationsInputSchema';

export const UserUpdateToOneWithWhereWithoutConversationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutConversationsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutConversationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutConversationsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutConversationsInputSchema;
