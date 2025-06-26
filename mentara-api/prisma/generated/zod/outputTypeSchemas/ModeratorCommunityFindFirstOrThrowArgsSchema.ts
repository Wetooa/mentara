import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityIncludeSchema } from '../inputTypeSchemas/ModeratorCommunityIncludeSchema'
import { ModeratorCommunityWhereInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereInputSchema'
import { ModeratorCommunityOrderByWithRelationInputSchema } from '../inputTypeSchemas/ModeratorCommunityOrderByWithRelationInputSchema'
import { ModeratorCommunityWhereUniqueInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereUniqueInputSchema'
import { ModeratorCommunityScalarFieldEnumSchema } from '../inputTypeSchemas/ModeratorCommunityScalarFieldEnumSchema'
import { ModeratorArgsSchema } from "../outputTypeSchemas/ModeratorArgsSchema"
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ModeratorCommunitySelectSchema: z.ZodType<Prisma.ModeratorCommunitySelect> = z.object({
  id: z.boolean().optional(),
  moderatorId: z.boolean().optional(),
  communityId: z.boolean().optional(),
  assignedAt: z.boolean().optional(),
  moderator: z.union([z.boolean(),z.lazy(() => ModeratorArgsSchema)]).optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
}).strict()

export const ModeratorCommunityFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ModeratorCommunityFindFirstOrThrowArgs> = z.object({
  select: ModeratorCommunitySelectSchema.optional(),
  include: z.lazy(() => ModeratorCommunityIncludeSchema).optional(),
  where: ModeratorCommunityWhereInputSchema.optional(),
  orderBy: z.union([ ModeratorCommunityOrderByWithRelationInputSchema.array(),ModeratorCommunityOrderByWithRelationInputSchema ]).optional(),
  cursor: ModeratorCommunityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ModeratorCommunityScalarFieldEnumSchema,ModeratorCommunityScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ModeratorCommunityFindFirstOrThrowArgsSchema;
