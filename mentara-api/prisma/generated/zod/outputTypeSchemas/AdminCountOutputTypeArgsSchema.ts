import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminCountOutputTypeSelectSchema } from './AdminCountOutputTypeSelectSchema';

export const AdminCountOutputTypeArgsSchema: z.ZodType<Prisma.AdminCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => AdminCountOutputTypeSelectSchema).nullish(),
}).strict();

export default AdminCountOutputTypeSelectSchema;
