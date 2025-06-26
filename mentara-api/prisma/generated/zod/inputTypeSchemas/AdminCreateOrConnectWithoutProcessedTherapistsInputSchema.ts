import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminWhereUniqueInputSchema } from './AdminWhereUniqueInputSchema';
import { AdminCreateWithoutProcessedTherapistsInputSchema } from './AdminCreateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedCreateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedCreateWithoutProcessedTherapistsInputSchema';

export const AdminCreateOrConnectWithoutProcessedTherapistsInputSchema: z.ZodType<Prisma.AdminCreateOrConnectWithoutProcessedTherapistsInput> = z.object({
  where: z.lazy(() => AdminWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AdminCreateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedCreateWithoutProcessedTherapistsInputSchema) ]),
}).strict();

export default AdminCreateOrConnectWithoutProcessedTherapistsInputSchema;
