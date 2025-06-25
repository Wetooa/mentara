import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { ModeratorCountOutputTypeArgsSchema } from "../outputTypeSchemas/ModeratorCountOutputTypeArgsSchema"

export const ModeratorIncludeSchema: z.ZodType<Prisma.ModeratorInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  moderatorCommunities: z.union([z.boolean(),z.lazy(() => ModeratorCommunityFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ModeratorCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ModeratorIncludeSchema;
