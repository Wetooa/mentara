import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockCreateWithoutBlockedInputSchema } from './UserBlockCreateWithoutBlockedInputSchema';
import { UserBlockUncheckedCreateWithoutBlockedInputSchema } from './UserBlockUncheckedCreateWithoutBlockedInputSchema';

export const UserBlockCreateOrConnectWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockCreateOrConnectWithoutBlockedInput> = z.object({
  where: z.lazy(() => UserBlockWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockedInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockedInputSchema) ]),
}).strict();

export default UserBlockCreateOrConnectWithoutBlockedInputSchema;
