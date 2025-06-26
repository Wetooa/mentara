import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutRepliesInputSchema } from './UserCreateWithoutRepliesInputSchema';
import { UserUncheckedCreateWithoutRepliesInputSchema } from './UserUncheckedCreateWithoutRepliesInputSchema';
import { UserCreateOrConnectWithoutRepliesInputSchema } from './UserCreateOrConnectWithoutRepliesInputSchema';
import { UserUpsertWithoutRepliesInputSchema } from './UserUpsertWithoutRepliesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutRepliesInputSchema } from './UserUpdateToOneWithWhereWithoutRepliesInputSchema';
import { UserUpdateWithoutRepliesInputSchema } from './UserUpdateWithoutRepliesInputSchema';
import { UserUncheckedUpdateWithoutRepliesInputSchema } from './UserUncheckedUpdateWithoutRepliesInputSchema';

export const UserUpdateOneRequiredWithoutRepliesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutRepliesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRepliesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutRepliesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutRepliesInputSchema),z.lazy(() => UserUpdateWithoutRepliesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRepliesInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutRepliesNestedInputSchema;
