import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MembershipIncludeSchema } from '../inputTypeSchemas/MembershipIncludeSchema'
import { MembershipWhereInputSchema } from '../inputTypeSchemas/MembershipWhereInputSchema'
import { MembershipOrderByWithRelationInputSchema } from '../inputTypeSchemas/MembershipOrderByWithRelationInputSchema'
import { MembershipWhereUniqueInputSchema } from '../inputTypeSchemas/MembershipWhereUniqueInputSchema'
import { MembershipScalarFieldEnumSchema } from '../inputTypeSchemas/MembershipScalarFieldEnumSchema'
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MembershipSelectSchema: z.ZodType<Prisma.MembershipSelect> = z.object({
  id: z.boolean().optional(),
  communityId: z.boolean().optional(),
  role: z.boolean().optional(),
  joinedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const MembershipFindManyArgsSchema: z.ZodType<Prisma.MembershipFindManyArgs> = z.object({
  select: MembershipSelectSchema.optional(),
  include: z.lazy(() => MembershipIncludeSchema).optional(),
  where: MembershipWhereInputSchema.optional(),
  orderBy: z.union([ MembershipOrderByWithRelationInputSchema.array(),MembershipOrderByWithRelationInputSchema ]).optional(),
  cursor: MembershipWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MembershipScalarFieldEnumSchema,MembershipScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default MembershipFindManyArgsSchema;
