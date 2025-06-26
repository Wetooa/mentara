import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutTherapistInputSchema } from './UserCreateWithoutTherapistInputSchema';
import { UserUncheckedCreateWithoutTherapistInputSchema } from './UserUncheckedCreateWithoutTherapistInputSchema';
import { UserCreateOrConnectWithoutTherapistInputSchema } from './UserCreateOrConnectWithoutTherapistInputSchema';
import { UserUpsertWithoutTherapistInputSchema } from './UserUpsertWithoutTherapistInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutTherapistInputSchema } from './UserUpdateToOneWithWhereWithoutTherapistInputSchema';
import { UserUpdateWithoutTherapistInputSchema } from './UserUpdateWithoutTherapistInputSchema';
import { UserUncheckedUpdateWithoutTherapistInputSchema } from './UserUncheckedUpdateWithoutTherapistInputSchema';

export const UserUpdateOneRequiredWithoutTherapistNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedCreateWithoutTherapistInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTherapistInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutTherapistInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutTherapistInputSchema),z.lazy(() => UserUpdateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTherapistInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutTherapistNestedInputSchema;
