import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutTherapistInputSchema } from './UserCreateWithoutTherapistInputSchema';
import { UserUncheckedCreateWithoutTherapistInputSchema } from './UserUncheckedCreateWithoutTherapistInputSchema';
import { UserCreateOrConnectWithoutTherapistInputSchema } from './UserCreateOrConnectWithoutTherapistInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutTherapistInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTherapistInputSchema),z.lazy(() => UserUncheckedCreateWithoutTherapistInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTherapistInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutTherapistInputSchema;
