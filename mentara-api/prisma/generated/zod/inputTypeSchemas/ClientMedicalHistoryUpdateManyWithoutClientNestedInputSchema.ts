import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryCreateWithoutClientInputSchema } from './ClientMedicalHistoryCreateWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema';
import { ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema } from './ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema';
import { ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInputSchema } from './ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInputSchema';
import { ClientMedicalHistoryCreateManyClientInputEnvelopeSchema } from './ClientMedicalHistoryCreateManyClientInputEnvelopeSchema';
import { ClientMedicalHistoryWhereUniqueInputSchema } from './ClientMedicalHistoryWhereUniqueInputSchema';
import { ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInputSchema } from './ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInputSchema';
import { ClientMedicalHistoryUpdateManyWithWhereWithoutClientInputSchema } from './ClientMedicalHistoryUpdateManyWithWhereWithoutClientInputSchema';
import { ClientMedicalHistoryScalarWhereInputSchema } from './ClientMedicalHistoryScalarWhereInputSchema';

export const ClientMedicalHistoryUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientMedicalHistoryCreateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryCreateWithoutClientInputSchema).array(),z.lazy(() => ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientMedicalHistoryCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ClientMedicalHistoryUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema),z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ClientMedicalHistoryUpdateManyWithoutClientNestedInputSchema;
