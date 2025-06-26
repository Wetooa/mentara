import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const AdminCountOutputTypeSelectSchema: z.ZodType<Prisma.AdminCountOutputTypeSelect> = z.object({
  processedTherapists: z.boolean().optional(),
}).strict();

export default AdminCountOutputTypeSelectSchema;
