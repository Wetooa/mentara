import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminIncludeSchema } from '../inputTypeSchemas/AdminIncludeSchema'
import { AdminWhereInputSchema } from '../inputTypeSchemas/AdminWhereInputSchema'
import { AdminOrderByWithRelationInputSchema } from '../inputTypeSchemas/AdminOrderByWithRelationInputSchema'
import { AdminWhereUniqueInputSchema } from '../inputTypeSchemas/AdminWhereUniqueInputSchema'
import { AdminScalarFieldEnumSchema } from '../inputTypeSchemas/AdminScalarFieldEnumSchema'
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

export const AdminFindFirstArgsSchema: z.ZodType<Prisma.AdminFindFirstArgs> = z.object({
  select: AdminSelectSchema.optional(),
  include: z.lazy(() => AdminIncludeSchema).optional(),
  where: AdminWhereInputSchema.optional(),
  orderBy: z.union([ AdminOrderByWithRelationInputSchema.array(),AdminOrderByWithRelationInputSchema ]).optional(),
  cursor: AdminWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AdminScalarFieldEnumSchema,AdminScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default AdminFindFirstArgsSchema;
