import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutBlockingInputSchema } from './UserUpdateWithoutBlockingInputSchema';
import { UserUncheckedUpdateWithoutBlockingInputSchema } from './UserUncheckedUpdateWithoutBlockingInputSchema';
import { UserCreateWithoutBlockingInputSchema } from './UserCreateWithoutBlockingInputSchema';
import { UserUncheckedCreateWithoutBlockingInputSchema } from './UserUncheckedCreateWithoutBlockingInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutBlockingInputSchema: z.ZodType<Prisma.UserUpsertWithoutBlockingInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlockingInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBlockingInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlockingInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutBlockingInputSchema;
