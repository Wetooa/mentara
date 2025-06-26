import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserBlockCreateWithoutBlockerInputSchema } from './UserBlockCreateWithoutBlockerInputSchema';
import { UserBlockUncheckedCreateWithoutBlockerInputSchema } from './UserBlockUncheckedCreateWithoutBlockerInputSchema';
import { UserBlockCreateOrConnectWithoutBlockerInputSchema } from './UserBlockCreateOrConnectWithoutBlockerInputSchema';
import { UserBlockUpsertWithWhereUniqueWithoutBlockerInputSchema } from './UserBlockUpsertWithWhereUniqueWithoutBlockerInputSchema';
import { UserBlockCreateManyBlockerInputEnvelopeSchema } from './UserBlockCreateManyBlockerInputEnvelopeSchema';
import { UserBlockWhereUniqueInputSchema } from './UserBlockWhereUniqueInputSchema';
import { UserBlockUpdateWithWhereUniqueWithoutBlockerInputSchema } from './UserBlockUpdateWithWhereUniqueWithoutBlockerInputSchema';
import { UserBlockUpdateManyWithWhereWithoutBlockerInputSchema } from './UserBlockUpdateManyWithWhereWithoutBlockerInputSchema';
import { UserBlockScalarWhereInputSchema } from './UserBlockScalarWhereInputSchema';

export const UserBlockUncheckedUpdateManyWithoutBlockerNestedInputSchema: z.ZodType<Prisma.UserBlockUncheckedUpdateManyWithoutBlockerNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserBlockCreateWithoutBlockerInputSchema),z.lazy(() => UserBlockCreateWithoutBlockerInputSchema).array(),z.lazy(() => UserBlockUncheckedCreateWithoutBlockerInputSchema),z.lazy(() => UserBlockUncheckedCreateWithoutBlockerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserBlockCreateOrConnectWithoutBlockerInputSchema),z.lazy(() => UserBlockCreateOrConnectWithoutBlockerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserBlockUpsertWithWhereUniqueWithoutBlockerInputSchema),z.lazy(() => UserBlockUpsertWithWhereUniqueWithoutBlockerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserBlockCreateManyBlockerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserBlockWhereUniqueInputSchema),z.lazy(() => UserBlockWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserBlockUpdateWithWhereUniqueWithoutBlockerInputSchema),z.lazy(() => UserBlockUpdateWithWhereUniqueWithoutBlockerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserBlockUpdateManyWithWhereWithoutBlockerInputSchema),z.lazy(() => UserBlockUpdateManyWithWhereWithoutBlockerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserBlockScalarWhereInputSchema),z.lazy(() => UserBlockScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default UserBlockUncheckedUpdateManyWithoutBlockerNestedInputSchema;
