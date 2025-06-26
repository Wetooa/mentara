import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreateWithoutUserInputSchema } from './AdminCreateWithoutUserInputSchema';
import { AdminUncheckedCreateWithoutUserInputSchema } from './AdminUncheckedCreateWithoutUserInputSchema';
import { AdminCreateOrConnectWithoutUserInputSchema } from './AdminCreateOrConnectWithoutUserInputSchema';
import { AdminWhereUniqueInputSchema } from './AdminWhereUniqueInputSchema';

export const AdminCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.AdminCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AdminCreateWithoutUserInputSchema),z.lazy(() => AdminUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AdminCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => AdminWhereUniqueInputSchema).optional()
}).strict();

export default AdminCreateNestedOneWithoutUserInputSchema;
