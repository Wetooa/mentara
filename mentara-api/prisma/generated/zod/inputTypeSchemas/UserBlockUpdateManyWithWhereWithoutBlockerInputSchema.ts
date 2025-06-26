import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockScalarWhereInputSchema } from './UserBlockScalarWhereInputSchema';
import { UserBlockUpdateManyMutationInputSchema } from './UserBlockUpdateManyMutationInputSchema';
import { UserBlockUncheckedUpdateManyWithoutBlockerInputSchema } from './UserBlockUncheckedUpdateManyWithoutBlockerInputSchema';

export const UserBlockUpdateManyWithWhereWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockUpdateManyWithWhereWithoutBlockerInput> = z.object({
  where: z.lazy(() => UserBlockScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserBlockUpdateManyMutationInputSchema),z.lazy(() => UserBlockUncheckedUpdateManyWithoutBlockerInputSchema) ]),
}).strict();

export default UserBlockUpdateManyWithWhereWithoutBlockerInputSchema;
