import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminWhereUniqueInputSchema } from './AdminWhereUniqueInputSchema';
import { AdminCreateWithoutUserInputSchema } from './AdminCreateWithoutUserInputSchema';
import { AdminUncheckedCreateWithoutUserInputSchema } from './AdminUncheckedCreateWithoutUserInputSchema';

export const AdminCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AdminCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AdminWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AdminCreateWithoutUserInputSchema),z.lazy(() => AdminUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default AdminCreateOrConnectWithoutUserInputSchema;
