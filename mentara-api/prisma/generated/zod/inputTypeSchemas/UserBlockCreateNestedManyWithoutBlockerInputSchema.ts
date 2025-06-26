import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockCreateWithoutBlockerInputSchema } from './UserBlockCreateWithoutBlockerInputSchema';
import { UserBlockUncheckedCreateWithoutBlockerInputSchema } from './UserBlockUncheckedCreateWithoutBlockerInputSchema';
import { UserBlockCreateOrConnectWithoutBlockerInputSchema } from './UserBlockCreateOrConnectWithoutBlockerInputSchema';
import { UserBlockCreateManyBlockerInputEnvelopeSchema } from './UserBlockCreateManyBlockerInputEnvelopeSchema';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';

export const UserBlockCreateNestedManyWithoutBlockerInputSchema: z.ZodType<Prisma.UserBlockCreateNestedManyWithoutBlockerInput> = z.object({
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockerInputSchema),z.lazy(() => UserBlockCreateWithoutBlockerInputSchema).array(),z.lazy(() => UserBlockUncheckedCreateWithoutBlockerInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserBlockCreateOrConnectWithoutBlockerInputSchema),z.lazy(() => UserBlockCreateOrConnectWithoutBlockerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserBlockCreateManyBlockerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default UserBlockCreateNestedManyWithoutBlockerInputSchema;
