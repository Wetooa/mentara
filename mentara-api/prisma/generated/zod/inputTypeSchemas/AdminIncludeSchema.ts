import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { TherapistFindManyArgsSchema } from "../outputTypeSchemas/TherapistFindManyArgsSchema"
import { AdminCountOutputTypeArgsSchema } from "../outputTypeSchemas/AdminCountOutputTypeArgsSchema"

export const AdminIncludeSchema: z.ZodType<Prisma.AdminInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  processedTherapists: z.union([z.boolean(),z.lazy(() => TherapistFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AdminCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default AdminIncludeSchema;
