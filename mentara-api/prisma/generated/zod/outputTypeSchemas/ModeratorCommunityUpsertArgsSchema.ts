import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityIncludeSchema } from '../inputTypeSchemas/ModeratorCommunityIncludeSchema'
import { ModeratorCommunityWhereUniqueInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereUniqueInputSchema'
import { ModeratorCommunityCreateInputSchema } from '../inputTypeSchemas/ModeratorCommunityCreateInputSchema'
import { ModeratorCommunityUncheckedCreateInputSchema } from '../inputTypeSchemas/ModeratorCommunityUncheckedCreateInputSchema'
import { ModeratorCommunityUpdateInputSchema } from '../inputTypeSchemas/ModeratorCommunityUpdateInputSchema'
import { ModeratorCommunityUncheckedUpdateInputSchema } from '../inputTypeSchemas/ModeratorCommunityUncheckedUpdateInputSchema'
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

export const ModeratorCommunityUpsertArgsSchema: z.ZodType<Prisma.ModeratorCommunityUpsertArgs> = z.object({
  select: ModeratorCommunitySelectSchema.optional(),
  include: z.lazy(() => ModeratorCommunityIncludeSchema).optional(),
  where: ModeratorCommunityWhereUniqueInputSchema,
  create: z.union([ ModeratorCommunityCreateInputSchema,ModeratorCommunityUncheckedCreateInputSchema ]),
  update: z.union([ ModeratorCommunityUpdateInputSchema,ModeratorCommunityUncheckedUpdateInputSchema ]),
}).strict() ;

export default ModeratorCommunityUpsertArgsSchema;
