import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutTherapistInputSchema } from './UserCreateWithoutTherapistInputSchema';
import { UserUncheckedCreateWithoutTherapistInputSchema } from './UserUncheckedCreateWithoutTherapistInputSchema';

export const UserCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutTherapistInputSchema;
