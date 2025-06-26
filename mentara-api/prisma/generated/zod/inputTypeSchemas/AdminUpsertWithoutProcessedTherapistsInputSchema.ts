import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminUpdateWithoutProcessedTherapistsInputSchema } from './AdminUpdateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema';
import { AdminCreateWithoutProcessedTherapistsInputSchema } from './AdminCreateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedCreateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedCreateWithoutProcessedTherapistsInputSchema';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';

export const AdminUpsertWithoutProcessedTherapistsInputSchema: z.ZodType<Prisma.AdminUpsertWithoutProcessedTherapistsInput> = z.object({
  update: z.union([ z.lazy(() => AdminUpdateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema) ]),
  create: z.union([ z.lazy(() => AdminCreateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedCreateWithoutProcessedTherapistsInputSchema) ]),
  where: z.lazy(() => AdminWhereInputSchema).optional()
}).strict();

export default AdminUpsertWithoutProcessedTherapistsInputSchema;
