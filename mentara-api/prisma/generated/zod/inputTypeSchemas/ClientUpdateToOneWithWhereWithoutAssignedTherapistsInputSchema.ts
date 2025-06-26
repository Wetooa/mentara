import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutAssignedTherapistsInputSchema } from './ClientUpdateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema';

export const ClientUpdateToOneWithWhereWithoutAssignedTherapistsInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutAssignedTherapistsInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutAssignedTherapistsInputSchema;
