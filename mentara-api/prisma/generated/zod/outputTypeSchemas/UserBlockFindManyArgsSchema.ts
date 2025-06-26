import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockIncludeSchema } from '../inputTypeSchemas/UserBlockIncludeSchema'
import { UserBlockWhereInputSchema } from '../inputTypeSchemas/UserBlockWhereInputSchema'
import { UserBlockOrderByWithRelationInputSchema } from '../inputTypeSchemas/UserBlockOrderByWithRelationInputSchema'
import { UserBlockWhereUniqueInputSchema } from '../inputTypeSchemas/UserBlockWhereUniqueInputSchema'
import { UserBlockScalarFieldEnumSchema } from '../inputTypeSchemas/UserBlockScalarFieldEnumSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const UserBlockSelectSchema: z.ZodType<Prisma.UserBlockSelect> = z.object({
  id: z.boolean().optional(),
  blockerId: z.boolean().optional(),
  blockedId: z.boolean().optional(),
  reason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  blocker: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  blocked: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserBlockFindManyArgsSchema: z.ZodType<Prisma.UserBlockFindManyArgs> = z.object({
  select: UserBlockSelectSchema.optional(),
  include: z.lazy(() => UserBlockIncludeSchema).optional(),
  where: UserBlockWhereInputSchema.optional(),
  orderBy: z.union([ UserBlockOrderByWithRelationInputSchema.array(),UserBlockOrderByWithRelationInputSchema ]).optional(),
  cursor: UserBlockWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserBlockScalarFieldEnumSchema,UserBlockScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default UserBlockFindManyArgsSchema;
