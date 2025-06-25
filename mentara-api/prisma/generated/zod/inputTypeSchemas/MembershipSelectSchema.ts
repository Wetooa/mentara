import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const MembershipSelectSchema: z.ZodType<Prisma.MembershipSelect> = z.object({
  id: z.boolean().optional(),
  communityId: z.boolean().optional(),
  role: z.boolean().optional(),
  joinedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default MembershipSelectSchema;
