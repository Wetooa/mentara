import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutReplyHeartsInputSchema } from './UserCreateWithoutReplyHeartsInputSchema';
import { UserUncheckedCreateWithoutReplyHeartsInputSchema } from './UserUncheckedCreateWithoutReplyHeartsInputSchema';
import { UserCreateOrConnectWithoutReplyHeartsInputSchema } from './UserCreateOrConnectWithoutReplyHeartsInputSchema';
import { UserUpsertWithoutReplyHeartsInputSchema } from './UserUpsertWithoutReplyHeartsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutReplyHeartsInputSchema } from './UserUpdateToOneWithWhereWithoutReplyHeartsInputSchema';
import { UserUpdateWithoutReplyHeartsInputSchema } from './UserUpdateWithoutReplyHeartsInputSchema';
import { UserUncheckedUpdateWithoutReplyHeartsInputSchema } from './UserUncheckedUpdateWithoutReplyHeartsInputSchema';

export const UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutReplyHeartsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutReplyHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReplyHeartsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutReplyHeartsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutReplyHeartsInputSchema),z.lazy(() => UserUpdateWithoutReplyHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReplyHeartsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema;
