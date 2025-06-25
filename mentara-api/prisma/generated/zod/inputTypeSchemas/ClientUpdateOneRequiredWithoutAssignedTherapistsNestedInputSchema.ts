import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutAssignedTherapistsInputSchema } from './ClientCreateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedCreateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedCreateWithoutAssignedTherapistsInputSchema';
import { ClientCreateOrConnectWithoutAssignedTherapistsInputSchema } from './ClientCreateOrConnectWithoutAssignedTherapistsInputSchema';
import { ClientUpsertWithoutAssignedTherapistsInputSchema } from './ClientUpsertWithoutAssignedTherapistsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutAssignedTherapistsInputSchema } from './ClientUpdateToOneWithWhereWithoutAssignedTherapistsInputSchema';
import { ClientUpdateWithoutAssignedTherapistsInputSchema } from './ClientUpdateWithoutAssignedTherapistsInputSchema';
import { ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema } from './ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema';

export const ClientUpdateOneRequiredWithoutAssignedTherapistsNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutAssignedTherapistsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutAssignedTherapistsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutAssignedTherapistsInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutAssignedTherapistsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUpdateWithoutAssignedTherapistsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutAssignedTherapistsInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutAssignedTherapistsNestedInputSchema;
