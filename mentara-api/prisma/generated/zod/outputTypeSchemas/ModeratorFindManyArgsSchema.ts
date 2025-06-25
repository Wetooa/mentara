import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorIncludeSchema } from '../inputTypeSchemas/ModeratorIncludeSchema'
import { ModeratorWhereInputSchema } from '../inputTypeSchemas/ModeratorWhereInputSchema'
import { ModeratorOrderByWithRelationInputSchema } from '../inputTypeSchemas/ModeratorOrderByWithRelationInputSchema'
import { ModeratorWhereUniqueInputSchema } from '../inputTypeSchemas/ModeratorWhereUniqueInputSchema'
import { ModeratorScalarFieldEnumSchema } from '../inputTypeSchemas/ModeratorScalarFieldEnumSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { ModeratorCountOutputTypeArgsSchema } from "../outputTypeSchemas/ModeratorCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ModeratorSelectSchema: z.ZodType<Prisma.ModeratorSelect> = z.object({
  userId: z.boolean().optional(),
  permissions: z.boolean().optional(),
  assignedCommunities: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  moderatorCommunities: z.union([z.boolean(),z.lazy(() => ModeratorCommunityFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ModeratorCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ModeratorFindManyArgsSchema: z.ZodType<Prisma.ModeratorFindManyArgs> = z.object({
  select: ModeratorSelectSchema.optional(),
  include: z.lazy(() => ModeratorIncludeSchema).optional(),
  where: ModeratorWhereInputSchema.optional(),
  orderBy: z.union([ ModeratorOrderByWithRelationInputSchema.array(),ModeratorOrderByWithRelationInputSchema ]).optional(),
  cursor: ModeratorWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ModeratorScalarFieldEnumSchema,ModeratorScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ModeratorFindManyArgsSchema;
