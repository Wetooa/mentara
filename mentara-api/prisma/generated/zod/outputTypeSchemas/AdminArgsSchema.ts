import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminSelectSchema } from '../inputTypeSchemas/AdminSelectSchema';
import { AdminIncludeSchema } from '../inputTypeSchemas/AdminIncludeSchema';

export const AdminArgsSchema: z.ZodType<Prisma.AdminDefaultArgs> = z.object({
  select: z.lazy(() => AdminSelectSchema).optional(),
  include: z.lazy(() => AdminIncludeSchema).optional(),
}).strict();

export default AdminArgsSchema;
