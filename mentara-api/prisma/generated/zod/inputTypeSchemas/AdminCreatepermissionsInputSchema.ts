import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const AdminCreatepermissionsInputSchema: z.ZodType<Prisma.AdminCreatepermissionsInput> = z.object({
  set: z.string().array()
}).strict();

export default AdminCreatepermissionsInputSchema;
