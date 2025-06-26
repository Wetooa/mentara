import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminIncludeSchema } from '../inputTypeSchemas/AdminIncludeSchema'
import { AdminCreateInputSchema } from '../inputTypeSchemas/AdminCreateInputSchema'
import { AdminUncheckedCreateInputSchema } from '../inputTypeSchemas/AdminUncheckedCreateInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { TherapistFindManyArgsSchema } from "../outputTypeSchemas/TherapistFindManyArgsSchema"
import { AdminCountOutputTypeArgsSchema } from "../outputTypeSchemas/AdminCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const AdminCreateArgsSchema: z.ZodType<Prisma.AdminCreateArgs> = z.object({
  select: AdminSelectSchema.optional(),
  include: z.lazy(() => AdminIncludeSchema).optional(),
  data: z.union([ AdminCreateInputSchema,AdminUncheckedCreateInputSchema ]),
}).strict() ;

export default AdminCreateArgsSchema;
