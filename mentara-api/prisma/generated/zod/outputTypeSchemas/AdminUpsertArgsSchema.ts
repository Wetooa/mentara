import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminIncludeSchema } from '../inputTypeSchemas/AdminIncludeSchema'
import { AdminWhereUniqueInputSchema } from '../inputTypeSchemas/AdminWhereUniqueInputSchema'
import { AdminCreateInputSchema } from '../inputTypeSchemas/AdminCreateInputSchema'
import { AdminUncheckedCreateInputSchema } from '../inputTypeSchemas/AdminUncheckedCreateInputSchema'
import { AdminUpdateInputSchema } from '../inputTypeSchemas/AdminUpdateInputSchema'
import { AdminUncheckedUpdateInputSchema } from '../inputTypeSchemas/AdminUncheckedUpdateInputSchema'
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

export const AdminUpsertArgsSchema: z.ZodType<Prisma.AdminUpsertArgs> = z.object({
  select: AdminSelectSchema.optional(),
  include: z.lazy(() => AdminIncludeSchema).optional(),
  where: AdminWhereUniqueInputSchema,
  create: z.union([ AdminCreateInputSchema,AdminUncheckedCreateInputSchema ]),
  update: z.union([ AdminUpdateInputSchema,AdminUncheckedUpdateInputSchema ]),
}).strict() ;

export default AdminUpsertArgsSchema;
