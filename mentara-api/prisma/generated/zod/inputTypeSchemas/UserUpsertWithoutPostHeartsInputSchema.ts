import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutPostHeartsInputSchema } from './UserUpdateWithoutPostHeartsInputSchema';
import { UserUncheckedUpdateWithoutPostHeartsInputSchema } from './UserUncheckedUpdateWithoutPostHeartsInputSchema';
import { UserCreateWithoutPostHeartsInputSchema } from './UserCreateWithoutPostHeartsInputSchema';
import { UserUncheckedCreateWithoutPostHeartsInputSchema } from './UserUncheckedCreateWithoutPostHeartsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutPostHeartsInputSchema: z.ZodType<Prisma.UserUpsertWithoutPostHeartsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPostHeartsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPostHeartsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutPostHeartsInputSchema;
