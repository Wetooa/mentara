import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceCreateWithoutClientInputSchema } from './ClientPreferenceCreateWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateWithoutClientInputSchema';
import { ClientPreferenceCreateOrConnectWithoutClientInputSchema } from './ClientPreferenceCreateOrConnectWithoutClientInputSchema';
import { ClientPreferenceUpsertWithWhereUniqueWithoutClientInputSchema } from './ClientPreferenceUpsertWithWhereUniqueWithoutClientInputSchema';
import { ClientPreferenceCreateManyClientInputEnvelopeSchema } from './ClientPreferenceCreateManyClientInputEnvelopeSchema';
import { ClientPreferenceWhereUniqueInputSchema } from './ClientPreferenceWhereUniqueInputSchema';
import { ClientPreferenceUpdateWithWhereUniqueWithoutClientInputSchema } from './ClientPreferenceUpdateWithWhereUniqueWithoutClientInputSchema';
import { ClientPreferenceUpdateManyWithWhereWithoutClientInputSchema } from './ClientPreferenceUpdateManyWithWhereWithoutClientInputSchema';
import { ClientPreferenceScalarWhereInputSchema } from './ClientPreferenceScalarWhereInputSchema';

export const ClientPreferenceUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.ClientPreferenceUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientPreferenceCreateWithoutClientInputSchema),z.lazy(() => ClientPreferenceCreateWithoutClientInputSchema).array(),z.lazy(() => ClientPreferenceUncheckedCreateWithoutClientInputSchema),z.lazy(() => ClientPreferenceUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientPreferenceCreateOrConnectWithoutClientInputSchema),z.lazy(() => ClientPreferenceCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ClientPreferenceUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ClientPreferenceUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientPreferenceCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ClientPreferenceWhereUniqueInputSchema),z.lazy(() => ClientPreferenceWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ClientPreferenceWhereUniqueInputSchema),z.lazy(() => ClientPreferenceWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ClientPreferenceWhereUniqueInputSchema),z.lazy(() => ClientPreferenceWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ClientPreferenceWhereUniqueInputSchema),z.lazy(() => ClientPreferenceWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ClientPreferenceUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ClientPreferenceUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ClientPreferenceUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => ClientPreferenceUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ClientPreferenceScalarWhereInputSchema),z.lazy(() => ClientPreferenceScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ClientPreferenceUpdateManyWithoutClientNestedInputSchema;
