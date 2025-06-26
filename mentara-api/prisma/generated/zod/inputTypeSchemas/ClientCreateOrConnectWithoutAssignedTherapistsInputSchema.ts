import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutAssignedTherapistsInputSchema } from './ClientCreateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedCreateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedCreateWithoutAssignedTherapistsInputSchema';

export const ClientCreateOrConnectWithoutAssignedTherapistsInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutAssignedTherapistsInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutAssignedTherapistsInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutAssignedTherapistsInputSchema;
