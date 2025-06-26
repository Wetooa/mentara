import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { TherapistFindManyArgsSchema } from "../outputTypeSchemas/TherapistFindManyArgsSchema"
import { AdminCountOutputTypeArgsSchema } from "../outputTypeSchemas/AdminCountOutputTypeArgsSchema"

export const AdminSelectSchema: z.ZodType<Prisma.AdminSelect> = z.object({
  userId: z.boolean().optional(),
  permissions: z.boolean().optional(),
  adminLevel: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  processedTherapists: z.union([z.boolean(),z.lazy(() => TherapistFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AdminCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default AdminSelectSchema;
