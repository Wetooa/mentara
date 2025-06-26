import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { AdminUpdateWithoutProcessedTherapistsInputSchema } from './AdminUpdateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema';

export const AdminUpdateToOneWithWhereWithoutProcessedTherapistsInputSchema: z.ZodType<Prisma.AdminUpdateToOneWithWhereWithoutProcessedTherapistsInput> = z.object({
  where: z.lazy(() => AdminWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AdminUpdateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema) ]),
}).strict();

export default AdminUpdateToOneWithWhereWithoutProcessedTherapistsInputSchema;
