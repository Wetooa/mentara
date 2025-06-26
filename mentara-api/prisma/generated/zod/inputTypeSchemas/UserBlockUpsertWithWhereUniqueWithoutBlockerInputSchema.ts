import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockUpdateWithoutBlockerInputSchema } from './UserBlockUpdateWithoutBlockerInputSchema';
import { UserBlockUncheckedUpdateWithoutBlockerInputSchema } from './UserBlockUncheckedUpdateWithoutBlockerInputSchema';
import { UserBlockCreateWithoutBlockerInputSchema } from './UserBlockCreateWithoutBlockerInputSchema';
import { UserBlockUncheckedCreateWithoutBlockerInputSchema } from './UserBlockUncheckedCreateWithoutBlockerInputSchema';

export const UserBlockUpsertWithWhereUniqueWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockUpsertWithWhereUniqueWithoutBlockerInput> = z.object({
  where: z.lazy(() => UserBlockWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserBlockUpdateWithoutBlockerInputSchema),z.lazy(() => UserBlockUncheckedUpdateWithoutBlockerInputSchema) ]),
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockerInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockerInputSchema) ]),
}).strict();

export default UserBlockUpsertWithWhereUniqueWithoutBlockerInputSchema;
