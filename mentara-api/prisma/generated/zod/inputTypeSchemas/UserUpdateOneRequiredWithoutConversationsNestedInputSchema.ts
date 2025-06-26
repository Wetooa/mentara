import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutConversationsInputSchema } from './UserCreateWithoutConversationsInputSchema';
import { UserUncheckedCreateWithoutConversationsInputSchema } from './UserUncheckedCreateWithoutConversationsInputSchema';
import { UserCreateOrConnectWithoutConversationsInputSchema } from './UserCreateOrConnectWithoutConversationsInputSchema';
import { UserUpsertWithoutConversationsInputSchema } from './UserUpsertWithoutConversationsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutConversationsInputSchema } from './UserUpdateToOneWithWhereWithoutConversationsInputSchema';
import { UserUpdateWithoutConversationsInputSchema } from './UserUpdateWithoutConversationsInputSchema';
import { UserUncheckedUpdateWithoutConversationsInputSchema } from './UserUncheckedUpdateWithoutConversationsInputSchema';

export const UserUpdateOneRequiredWithoutConversationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutConversationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutConversationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutConversationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutConversationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutConversationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutConversationsInputSchema),z.lazy(() => UserUpdateWithoutConversationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutConversationsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutConversationsNestedInputSchema;
