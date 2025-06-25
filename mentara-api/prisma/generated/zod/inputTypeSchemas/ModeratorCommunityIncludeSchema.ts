import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorArgsSchema } from "../outputTypeSchemas/ModeratorArgsSchema"
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"

export const ModeratorCommunityIncludeSchema: z.ZodType<Prisma.ModeratorCommunityInclude> = z.object({
  moderator: z.union([z.boolean(),z.lazy(() => ModeratorArgsSchema)]).optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
}).strict()

export default ModeratorCommunityIncludeSchema;
