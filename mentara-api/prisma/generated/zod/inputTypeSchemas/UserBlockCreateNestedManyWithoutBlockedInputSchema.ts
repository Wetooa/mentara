import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockCreateWithoutBlockedInputSchema } from './UserBlockCreateWithoutBlockedInputSchema';
import { UserBlockUncheckedCreateWithoutBlockedInputSchema } from './UserBlockUncheckedCreateWithoutBlockedInputSchema';
import { UserBlockCreateOrConnectWithoutBlockedInputSchema } from './UserBlockCreateOrConnectWithoutBlockedInputSchema';
import { UserBlockCreateManyBlockedInputEnvelopeSchema } from './UserBlockCreateManyBlockedInputEnvelopeSchema';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';

export const UserBlockCreateNestedManyWithoutBlockedInputSchema: z.ZodType<Prisma.UserBlockCreateNestedManyWithoutBlockedInput> = z.object({
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockedInputSchema),z.lazy(() => UserBlockCreateWithoutBlockedInputSchema).array(),z.lazy(() => UserBlockUncheckedCreateWithoutBlockedInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockedInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserBlockCreateOrConnectWithoutBlockedInputSchema),z.lazy(() => UserBlockCreateOrConnectWithoutBlockedInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserBlockCreateManyBlockedInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default UserBlockCreateNestedManyWithoutBlockedInputSchema;
