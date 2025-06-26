import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityIncludeSchema } from '../inputTypeSchemas/ModeratorCommunityIncludeSchema'
import { ModeratorCommunityCreateInputSchema } from '../inputTypeSchemas/ModeratorCommunityCreateInputSchema'
import { ModeratorCommunityUncheckedCreateInputSchema } from '../inputTypeSchemas/ModeratorCommunityUncheckedCreateInputSchema'
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

export const ModeratorCommunityCreateArgsSchema: z.ZodType<Prisma.ModeratorCommunityCreateArgs> = z.object({
  select: ModeratorCommunitySelectSchema.optional(),
  include: z.lazy(() => ModeratorCommunityIncludeSchema).optional(),
  data: z.union([ ModeratorCommunityCreateInputSchema,ModeratorCommunityUncheckedCreateInputSchema ]),
}).strict() ;

export default ModeratorCommunityCreateArgsSchema;
