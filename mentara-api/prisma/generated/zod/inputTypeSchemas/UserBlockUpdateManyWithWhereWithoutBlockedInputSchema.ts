import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockScalarWhereInputSchema } from './UserBlockScalarWhereInputSchema';
import { UserBlockUpdateManyMutationInputSchema } from './UserBlockUpdateManyMutationInputSchema';
import { UserBlockUncheckedUpdateManyWithoutBlockedInputSchema } from './UserBlockUncheckedUpdateManyWithoutBlockedInputSchema';

export const UserBlockUpdateManyWithWhereWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockUpdateManyWithWhereWithoutBlockedInput> = z.object({
  where: z.lazy(() => UserBlockScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserBlockUpdateManyMutationInputSchema),z.lazy(() => UserBlockUncheckedUpdateManyWithoutBlockedInputSchema) ]),
}).strict();

export default UserBlockUpdateManyWithWhereWithoutBlockedInputSchema;
