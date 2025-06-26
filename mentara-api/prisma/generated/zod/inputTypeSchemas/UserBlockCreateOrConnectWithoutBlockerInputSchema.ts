import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockCreateWithoutBlockerInputSchema } from './UserBlockCreateWithoutBlockerInputSchema';
import { UserBlockUncheckedCreateWithoutBlockerInputSchema } from './UserBlockUncheckedCreateWithoutBlockerInputSchema';

export const UserBlockCreateOrConnectWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockCreateOrConnectWithoutBlockerInput> = z.object({
  where: z.lazy(() => UserBlockWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockerInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockerInputSchema) ]),
}).strict();

export default UserBlockCreateOrConnectWithoutBlockerInputSchema;
