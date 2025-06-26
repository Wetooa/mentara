import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockUpdateWithoutBlockedInputSchema } from './UserBlockUpdateWithoutBlockedInputSchema';
import { UserBlockUncheckedUpdateWithoutBlockedInputSchema } from './UserBlockUncheckedUpdateWithoutBlockedInputSchema';
import { UserBlockCreateWithoutBlockedInputSchema } from './UserBlockCreateWithoutBlockedInputSchema';
import { UserBlockUncheckedCreateWithoutBlockedInputSchema } from './UserBlockUncheckedCreateWithoutBlockedInputSchema';

export const UserBlockUpsertWithWhereUniqueWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockUpsertWithWhereUniqueWithoutBlockedInput> = z.object({
  where: z.lazy(() => UserBlockWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserBlockUpdateWithoutBlockedInputSchema),z.lazy(() => UserBlockUncheckedUpdateWithoutBlockedInputSchema) ]),
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockedInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockedInputSchema) ]),
}).strict();

export default UserBlockUpsertWithWhereUniqueWithoutBlockedInputSchema;
