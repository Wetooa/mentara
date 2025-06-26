import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MembershipFindManyArgsSchema } from "../outputTypeSchemas/MembershipFindManyArgsSchema"
import { ModeratorCommunityFindManyArgsSchema } from "../outputTypeSchemas/ModeratorCommunityFindManyArgsSchema"
import { RoomGroupFindManyArgsSchema } from "../outputTypeSchemas/RoomGroupFindManyArgsSchema"
import { CommunityCountOutputTypeArgsSchema } from "../outputTypeSchemas/CommunityCountOutputTypeArgsSchema"

export const CommunityIncludeSchema: z.ZodType<Prisma.CommunityInclude> = z.object({
  memberships: z.union([z.boolean(),z.lazy(() => MembershipFindManyArgsSchema)]).optional(),
  moderatorCommunities: z.union([z.boolean(),z.lazy(() => ModeratorCommunityFindManyArgsSchema)]).optional(),
  roomGroups: z.union([z.boolean(),z.lazy(() => RoomGroupFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CommunityCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default CommunityIncludeSchema;
