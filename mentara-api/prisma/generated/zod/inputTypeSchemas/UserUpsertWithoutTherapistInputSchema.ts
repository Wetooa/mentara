import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutTherapistInputSchema } from './UserUpdateWithoutTherapistInputSchema';
import { UserUncheckedUpdateWithoutTherapistInputSchema } from './UserUncheckedUpdateWithoutTherapistInputSchema';
import { UserCreateWithoutTherapistInputSchema } from './UserCreateWithoutTherapistInputSchema';
import { UserUncheckedCreateWithoutTherapistInputSchema } from './UserUncheckedCreateWithoutTherapistInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutTherapistInputSchema: z.ZodType<Prisma.UserUpsertWithoutTherapistInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedCreateWithoutTherapistInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutTherapistInputSchema;
