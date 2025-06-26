import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutTherapistInputSchema } from './UserUpdateWithoutTherapistInputSchema';
import { UserUncheckedUpdateWithoutTherapistInputSchema } from './UserUncheckedUpdateWithoutTherapistInputSchema';

export const UserUpdateToOneWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutTherapistInputSchema;
