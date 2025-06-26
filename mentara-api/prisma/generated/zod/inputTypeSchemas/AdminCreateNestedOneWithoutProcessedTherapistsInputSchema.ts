import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreateWithoutProcessedTherapistsInputSchema } from './AdminCreateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedCreateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedCreateWithoutProcessedTherapistsInputSchema';
import { AdminCreateOrConnectWithoutProcessedTherapistsInputSchema } from './AdminCreateOrConnectWithoutProcessedTherapistsInputSchema';
import { AdminWhereUniqueInputSchema } from './AdminWhereUniqueInputSchema';

export const AdminCreateNestedOneWithoutProcessedTherapistsInputSchema: z.ZodType<Prisma.AdminCreateNestedOneWithoutProcessedTherapistsInput> = z.object({
  create: z.union([ z.lazy(() => AdminCreateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedCreateWithoutProcessedTherapistsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AdminCreateOrConnectWithoutProcessedTherapistsInputSchema).optional(),
  connect: z.lazy(() => AdminWhereUniqueInputSchema).optional()
}).strict();

export default AdminCreateNestedOneWithoutProcessedTherapistsInputSchema;
