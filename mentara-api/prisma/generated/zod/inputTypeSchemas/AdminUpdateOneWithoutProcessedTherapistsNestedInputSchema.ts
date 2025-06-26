import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreateWithoutProcessedTherapistsInputSchema } from './AdminCreateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedCreateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedCreateWithoutProcessedTherapistsInputSchema';
import { AdminCreateOrConnectWithoutProcessedTherapistsInputSchema } from './AdminCreateOrConnectWithoutProcessedTherapistsInputSchema';
import { AdminUpsertWithoutProcessedTherapistsInputSchema } from './AdminUpsertWithoutProcessedTherapistsInputSchema';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { AdminWhereUniqueInputSchema } from './AdminWhereUniqueInputSchema';
import { AdminUpdateToOneWithWhereWithoutProcessedTherapistsInputSchema } from './AdminUpdateToOneWithWhereWithoutProcessedTherapistsInputSchema';
import { AdminUpdateWithoutProcessedTherapistsInputSchema } from './AdminUpdateWithoutProcessedTherapistsInputSchema';
import { AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema } from './AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema';

export const AdminUpdateOneWithoutProcessedTherapistsNestedInputSchema: z.ZodType<Prisma.AdminUpdateOneWithoutProcessedTherapistsNestedInput> = z.object({
  create: z.union([ z.lazy(() => AdminCreateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedCreateWithoutProcessedTherapistsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AdminCreateOrConnectWithoutProcessedTherapistsInputSchema).optional(),
  upsert: z.lazy(() => AdminUpsertWithoutProcessedTherapistsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => AdminWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => AdminWhereInputSchema) ]).optional(),
  connect: z.lazy(() => AdminWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AdminUpdateToOneWithWhereWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUpdateWithoutProcessedTherapistsInputSchema),z.lazy(() => AdminUncheckedUpdateWithoutProcessedTherapistsInputSchema) ]).optional(),
}).strict();

export default AdminUpdateOneWithoutProcessedTherapistsNestedInputSchema;
