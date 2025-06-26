import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutAssignedTherapistsInputSchema } from './ClientCreateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedCreateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedCreateWithoutAssignedTherapistsInputSchema';
import { ClientCreateOrConnectWithoutAssignedTherapistsInputSchema } from './ClientCreateOrConnectWithoutAssignedTherapistsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutAssignedTherapistsInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutAssignedTherapistsInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutAssignedTherapistsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutAssignedTherapistsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutAssignedTherapistsInputSchema;
