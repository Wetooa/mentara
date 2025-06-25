import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MembershipFindManyArgsSchema } from "../outputTypeSchemas/MembershipFindManyArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { RoomGroupFindManyArgsSchema } from "../outputTypeSchemas/RoomGroupFindManyArgsSchema"
import { CommunityCountOutputTypeArgsSchema } from "../outputTypeSchemas/CommunityCountOutputTypeArgsSchema"

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

export default CommunitySelectSchema;
