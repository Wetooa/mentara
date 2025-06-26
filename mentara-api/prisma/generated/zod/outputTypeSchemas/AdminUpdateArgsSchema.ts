import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminIncludeSchema } from '../inputTypeSchemas/AdminIncludeSchema'
import { AdminUpdateInputSchema } from '../inputTypeSchemas/AdminUpdateInputSchema'
import { AdminUncheckedUpdateInputSchema } from '../inputTypeSchemas/AdminUncheckedUpdateInputSchema'
import { AdminWhereUniqueInputSchema } from '../inputTypeSchemas/AdminWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const AdminSelectSchema: z.ZodType<Prisma.AdminSelect> = z.object({
  userId: z.boolean().optional(),
  permissions: z.boolean().optional(),
  adminLevel: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const AdminUpdateArgsSchema: z.ZodType<Prisma.AdminUpdateArgs> = z.object({
  select: AdminSelectSchema.optional(),
  include: z.lazy(() => AdminIncludeSchema).optional(),
  data: z.union([ AdminUpdateInputSchema,AdminUncheckedUpdateInputSchema ]),
  where: AdminWhereUniqueInputSchema,
}).strict() ;

export default AdminUpdateArgsSchema;
