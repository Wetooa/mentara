import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistCreateWithoutClientInputSchema } from './ClientTherapistCreateWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateWithoutClientInputSchema } from './ClientTherapistUncheckedCreateWithoutClientInputSchema';
import { ClientTherapistCreateOrConnectWithoutClientInputSchema } from './ClientTherapistCreateOrConnectWithoutClientInputSchema';
import { ClientTherapistUpsertWithWhereUniqueWithoutClientInputSchema } from './ClientTherapistUpsertWithWhereUniqueWithoutClientInputSchema';
import { ClientTherapistCreateManyClientInputEnvelopeSchema } from './ClientTherapistCreateManyClientInputEnvelopeSchema';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistUpdateWithWhereUniqueWithoutClientInputSchema } from './ClientTherapistUpdateWithWhereUniqueWithoutClientInputSchema';
import { ClientTherapistUpdateManyWithWhereWithoutClientInputSchema } from './ClientTherapistUpdateManyWithWhereWithoutClientInputSchema';
import { ClientTherapistScalarWhereInputSchema } from './ClientTherapistScalarWhereInputSchema';

export const ClientTherapistUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.ClientTherapistUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutClientInputSchema),z.lazy(() => ClientTherapistCreateWithoutClientInputSchema).array(),z.lazy(() => ClientTherapistUncheckedCreateWithoutClientInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientTherapistCreateOrConnectWithoutClientInputSchema),z.lazy(() => ClientTherapistCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ClientTherapistUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ClientTherapistUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientTherapistCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ClientTherapistUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ClientTherapistUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ClientTherapistUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => ClientTherapistUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ClientTherapistScalarWhereInputSchema),z.lazy(() => ClientTherapistScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ClientTherapistUpdateManyWithoutClientNestedInputSchema;
