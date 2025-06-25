import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutClientMedicalHistoryInputSchema } from './ClientCreateWithoutClientMedicalHistoryInputSchema';
import { ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema } from './ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema';
import { ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema } from './ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutClientMedicalHistoryInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutClientMedicalHistoryInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutClientMedicalHistoryInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutClientMedicalHistoryInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutClientMedicalHistoryInputSchema;
