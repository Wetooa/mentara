import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutPostHeartsInputSchema } from './UserCreateWithoutPostHeartsInputSchema';
import { UserUncheckedCreateWithoutPostHeartsInputSchema } from './UserUncheckedCreateWithoutPostHeartsInputSchema';

export const UserCreateOrConnectWithoutPostHeartsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPostHeartsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPostHeartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPostHeartsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutPostHeartsInputSchema;
