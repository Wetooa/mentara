import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutPostHeartsInputSchema } from './UserUpdateWithoutPostHeartsInputSchema';
import { UserUncheckedUpdateWithoutPostHeartsInputSchema } from './UserUncheckedUpdateWithoutPostHeartsInputSchema';

export const UserUpdateToOneWithWhereWithoutPostHeartsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPostHeartsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPostHeartsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutPostHeartsInputSchema;
