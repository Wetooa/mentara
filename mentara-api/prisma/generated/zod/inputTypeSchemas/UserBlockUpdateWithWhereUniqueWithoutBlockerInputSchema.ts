import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockUpdateWithoutBlockerInputSchema } from './UserBlockUpdateWithoutBlockerInputSchema';
import { UserBlockUncheckedUpdateWithoutBlockerInputSchema } from './UserBlockUncheckedUpdateWithoutBlockerInputSchema';

export const UserBlockUpdateWithWhereUniqueWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockUpdateWithWhereUniqueWithoutBlockerInput> = z.object({
  where: z.lazy(() => UserBlockWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserBlockUpdateWithoutBlockerInputSchema),z.lazy(() => UserBlockUncheckedUpdateWithoutBlockerInputSchema) ]),
}).strict();

export default UserBlockUpdateWithWhereUniqueWithoutBlockerInputSchema;
