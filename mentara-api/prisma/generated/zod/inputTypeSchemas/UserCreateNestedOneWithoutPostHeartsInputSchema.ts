import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutPostHeartsInputSchema } from './UserCreateWithoutPostHeartsInputSchema';
import { UserUncheckedCreateWithoutPostHeartsInputSchema } from './UserUncheckedCreateWithoutPostHeartsInputSchema';
import { UserCreateOrConnectWithoutPostHeartsInputSchema } from './UserCreateOrConnectWithoutPostHeartsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutPostHeartsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPostHeartsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPostHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPostHeartsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutPostHeartsInputSchema;
