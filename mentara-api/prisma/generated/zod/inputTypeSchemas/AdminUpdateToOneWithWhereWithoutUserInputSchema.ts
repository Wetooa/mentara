import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { AdminUpdateWithoutUserInputSchema } from './AdminUpdateWithoutUserInputSchema';
import { AdminUncheckedUpdateWithoutUserInputSchema } from './AdminUncheckedUpdateWithoutUserInputSchema';

export const AdminUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AdminUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AdminWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AdminUpdateWithoutUserInputSchema),z.lazy(() => AdminUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default AdminUpdateToOneWithWhereWithoutUserInputSchema;
