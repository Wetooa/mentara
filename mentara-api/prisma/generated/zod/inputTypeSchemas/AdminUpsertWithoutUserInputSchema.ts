import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminUpdateWithoutUserInputSchema } from './AdminUpdateWithoutUserInputSchema';
import { AdminUncheckedUpdateWithoutUserInputSchema } from './AdminUncheckedUpdateWithoutUserInputSchema';
import { AdminCreateWithoutUserInputSchema } from './AdminCreateWithoutUserInputSchema';
import { AdminUncheckedCreateWithoutUserInputSchema } from './AdminUncheckedCreateWithoutUserInputSchema';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';

export const AdminUpsertWithoutUserInputSchema: z.ZodType<Prisma.AdminUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => AdminUpdateWithoutUserInputSchema),z.lazy(() => AdminUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AdminCreateWithoutUserInputSchema),z.lazy(() => AdminUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => AdminWhereInputSchema).optional()
}).strict();

export default AdminUpsertWithoutUserInputSchema;
