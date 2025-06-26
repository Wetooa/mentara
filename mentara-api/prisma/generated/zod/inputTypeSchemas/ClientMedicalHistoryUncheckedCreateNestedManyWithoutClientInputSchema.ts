import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryCreateWithoutClientInputSchema } from './ClientMedicalHistoryCreateWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema';
import { ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema } from './ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema';
import { ClientMedicalHistoryCreateManyClientInputEnvelopeSchema } from './ClientMedicalHistoryCreateManyClientInputEnvelopeSchema';
import { ClientMedicalHistoryWhereUniqueInputSchema } from './ClientMedicalHistoryWhereUniqueInputSchema';

export const ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => ClientMedicalHistoryCreateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryCreateWithoutClientInputSchema).array(),z.lazy(() => ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema),z.lazy(() => ClientMedicalHistoryCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientMedicalHistoryCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema),z.lazy(() => ClientMedicalHistoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema;
