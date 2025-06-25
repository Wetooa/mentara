import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityIncludeSchema } from '../inputTypeSchemas/CommunityIncludeSchema'
import { CommunityWhereInputSchema } from '../inputTypeSchemas/CommunityWhereInputSchema'
import { CommunityOrderByWithRelationInputSchema } from '../inputTypeSchemas/CommunityOrderByWithRelationInputSchema'
import { CommunityWhereUniqueInputSchema } from '../inputTypeSchemas/CommunityWhereUniqueInputSchema'
import { CommunityScalarFieldEnumSchema } from '../inputTypeSchemas/CommunityScalarFieldEnumSchema'
import { MembershipFindManyArgsSchema } from "../outputTypeSchemas/MembershipFindManyArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { RoomGroupFindManyArgsSchema } from "../outputTypeSchemas/RoomGroupFindManyArgsSchema"
import { CommunityCountOutputTypeArgsSchema } from "../outputTypeSchemas/CommunityCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CommunitySelectSchema: z.ZodType<Prisma.CommunitySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  description: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  memberships: z.union([z.boolean(),z.lazy(() => MembershipFindManyArgsSchema)]).optional(),
  moderatorCommunities: z.union([z.boolean(),z.lazy(() => ModeratorCommunityFindManyArgsSchema)]).optional(),
  roomGroups: z.union([z.boolean(),z.lazy(() => RoomGroupFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CommunityCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CommunityFindFirstArgsSchema: z.ZodType<Prisma.CommunityFindFirstArgs> = z.object({
  select: CommunitySelectSchema.optional(),
  include: z.lazy(() => CommunityIncludeSchema).optional(),
  where: CommunityWhereInputSchema.optional(),
  orderBy: z.union([ CommunityOrderByWithRelationInputSchema.array(),CommunityOrderByWithRelationInputSchema ]).optional(),
  cursor: CommunityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CommunityScalarFieldEnumSchema,CommunityScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default CommunityFindFirstArgsSchema;
