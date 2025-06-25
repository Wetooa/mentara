import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const MembershipIncludeSchema: z.ZodType<Prisma.MembershipInclude> = z.object({
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default MembershipIncludeSchema;
