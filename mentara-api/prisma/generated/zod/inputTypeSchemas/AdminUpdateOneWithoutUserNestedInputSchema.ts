import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { AdminCreateWithoutUserInputSchema } from './AdminCreateWithoutUserInputSchema';
import { AdminUncheckedCreateWithoutUserInputSchema } from './AdminUncheckedCreateWithoutUserInputSchema';
import { AdminCreateOrConnectWithoutUserInputSchema } from './AdminCreateOrConnectWithoutUserInputSchema';
import { AdminUpsertWithoutUserInputSchema } from './AdminUpsertWithoutUserInputSchema';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { AdminWhereUniqueInputSchema } from './AdminWhereUniqueInputSchema';
import { AdminUpdateToOneWithWhereWithoutUserInputSchema } from './AdminUpdateToOneWithWhereWithoutUserInputSchema';
import { AdminUpdateWithoutUserInputSchema } from './AdminUpdateWithoutUserInputSchema';
import { AdminUncheckedUpdateWithoutUserInputSchema } from './AdminUncheckedUpdateWithoutUserInputSchema';

export const AdminUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.AdminUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AdminCreateWithoutUserInputSchema),z.lazy(() => AdminUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AdminCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => AdminUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => AdminWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => AdminWhereInputSchema) ]).optional(),
  connect: z.lazy(() => AdminWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AdminUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => AdminUpdateWithoutUserInputSchema),z.lazy(() => AdminUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export default AdminUpdateOneWithoutUserNestedInputSchema;
