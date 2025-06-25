import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MembershipIncludeSchema } from '../inputTypeSchemas/MembershipIncludeSchema'
import { MembershipUpdateInputSchema } from '../inputTypeSchemas/MembershipUpdateInputSchema'
import { MembershipUncheckedUpdateInputSchema } from '../inputTypeSchemas/MembershipUncheckedUpdateInputSchema'
import { MembershipWhereUniqueInputSchema } from '../inputTypeSchemas/MembershipWhereUniqueInputSchema'
import { CommunityArgsSchema } from "../outputTypeSchemas/CommunityArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MembershipSelectSchema: z.ZodType<Prisma.MembershipSelect> = z.object({
  id: z.boolean().optional(),
  communityId: z.boolean().optional(),
  role: z.boolean().optional(),
  joinedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  community: z.union([z.boolean(),z.lazy(() => CommunityArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const MembershipUpdateArgsSchema: z.ZodType<Prisma.MembershipUpdateArgs> = z.object({
  select: MembershipSelectSchema.optional(),
  include: z.lazy(() => MembershipIncludeSchema).optional(),
  data: z.union([ MembershipUpdateInputSchema,MembershipUncheckedUpdateInputSchema ]),
  where: MembershipWhereUniqueInputSchema,
}).strict() ;

export default MembershipUpdateArgsSchema;
