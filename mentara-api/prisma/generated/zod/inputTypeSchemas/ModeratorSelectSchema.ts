import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { ModeratorCountOutputTypeArgsSchema } from "../outputTypeSchemas/ModeratorCountOutputTypeArgsSchema"

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

export default ModeratorSelectSchema;
