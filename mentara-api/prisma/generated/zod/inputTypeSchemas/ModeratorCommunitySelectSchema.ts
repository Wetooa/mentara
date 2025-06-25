import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorArgsSchema } from "../outputTypeSchemas/ModeratorArgsSchema"
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"

export const ModeratorCommunitySelectSchema: z.ZodType<Prisma.ModeratorCommunitySelect> = z.object({
  id: z.boolean().optional(),
  moderatorId: z.boolean().optional(),
  communityId: z.boolean().optional(),
  assignedAt: z.boolean().optional(),
  moderator: z.union([z.boolean(),z.lazy(() => ModeratorArgsSchema)]).optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
}).strict()

export default ModeratorCommunitySelectSchema;
