import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockUpdateWithoutBlockedInputSchema } from './UserBlockUpdateWithoutBlockedInputSchema';
import { UserBlockUncheckedUpdateWithoutBlockedInputSchema } from './UserBlockUncheckedUpdateWithoutBlockedInputSchema';

export const UserBlockUpdateWithWhereUniqueWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockUpdateWithWhereUniqueWithoutBlockedInput> = z.object({
  where: z.lazy(() => UserBlockWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserBlockUpdateWithoutBlockedInputSchema),z.lazy(() => UserBlockUncheckedUpdateWithoutBlockedInputSchema) ]),
}).strict();

export default UserBlockUpdateWithWhereUniqueWithoutBlockedInputSchema;
