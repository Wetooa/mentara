import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockCreateWithoutBlockedInputSchema } from './UserBlockCreateWithoutBlockedInputSchema';
import { UserBlockUncheckedCreateWithoutBlockedInputSchema } from './UserBlockUncheckedCreateWithoutBlockedInputSchema';
import { UserBlockCreateOrConnectWithoutBlockedInputSchema } from './UserBlockCreateOrConnectWithoutBlockedInputSchema';
import { UserBlockUpsertWithWhereUniqueWithoutBlockedInputSchema } from './UserBlockUpsertWithWhereUniqueWithoutBlockedInputSchema';
import { UserBlockCreateManyBlockedInputEnvelopeSchema } from './UserBlockCreateManyBlockedInputEnvelopeSchema';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockUpdateWithWhereUniqueWithoutBlockedInputSchema } from './UserBlockUpdateWithWhereUniqueWithoutBlockedInputSchema';
import { UserBlockUpdateManyWithWhereWithoutBlockedInputSchema } from './UserBlockUpdateManyWithWhereWithoutBlockedInputSchema';
import { UserBlockScalarWhereInputSchema } from './UserBlockScalarWhereInputSchema';

export const UserBlockUncheckedUpdateManyWithoutBlockedNestedInputSchema: z.ZodType<Prisma.UserBlockUncheckedUpdateManyWithoutBlockedNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockedInputSchema),z.lazy(() => UserBlockCreateWithoutBlockedInputSchema).array(),z.lazy(() => UserBlockUncheckedCreateWithoutBlockedInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockedInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserBlockCreateOrConnectWithoutBlockedInputSchema),z.lazy(() => UserBlockCreateOrConnectWithoutBlockedInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserBlockUpsertWithWhereUniqueWithoutBlockedInputSchema),z.lazy(() => UserBlockUpsertWithWhereUniqueWithoutBlockedInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserBlockCreateManyBlockedInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserBlockUpdateWithWhereUniqueWithoutBlockedInputSchema),z.lazy(() => UserBlockUpdateWithWhereUniqueWithoutBlockedInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserBlockUpdateManyWithWhereWithoutBlockedInputSchema),z.lazy(() => UserBlockUpdateManyWithWhereWithoutBlockedInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserBlockScalarWhereInputSchema),z.lazy(() => UserBlockScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default UserBlockUncheckedUpdateManyWithoutBlockedNestedInputSchema;
