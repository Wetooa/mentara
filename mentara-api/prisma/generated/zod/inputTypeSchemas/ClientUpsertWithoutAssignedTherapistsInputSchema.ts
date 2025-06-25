import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutAssignedTherapistsInputSchema } from './ClientUpdateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema';
import { ClientCreateWithoutAssignedTherapistsInputSchema } from './ClientCreateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedCreateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedCreateWithoutAssignedTherapistsInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutAssignedTherapistsInputSchema: z.ZodType<Prisma.ClientUpsertWithoutAssignedTherapistsInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutAssignedTherapistsInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutAssignedTherapistsInputSchema;
