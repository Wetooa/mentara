import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutModeratorInputSchema } from './UserCreateWithoutModeratorInputSchema';
import { UserUncheckedCreateWithoutModeratorInputSchema } from './UserUncheckedCreateWithoutModeratorInputSchema';
import { UserCreateOrConnectWithoutModeratorInputSchema } from './UserCreateOrConnectWithoutModeratorInputSchema';
import { UserUpsertWithoutModeratorInputSchema } from './UserUpsertWithoutModeratorInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutModeratorInputSchema } from './UserUpdateToOneWithWhereWithoutModeratorInputSchema';
import { UserUpdateWithoutModeratorInputSchema } from './UserUpdateWithoutModeratorInputSchema';
import { UserUncheckedUpdateWithoutModeratorInputSchema } from './UserUncheckedUpdateWithoutModeratorInputSchema';

export const UserUpdateOneRequiredWithoutModeratorNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutModeratorNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedCreateWithoutModeratorInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutModeratorInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutModeratorInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutModeratorInputSchema),z.lazy(() => UserUpdateWithoutModeratorInputSchema),z.lazy(() => UserUncheckedUpdateWithoutModeratorInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutModeratorNestedInputSchema;
