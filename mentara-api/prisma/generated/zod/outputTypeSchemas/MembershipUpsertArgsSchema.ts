import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MembershipIncludeSchema } from '../inputTypeSchemas/MembershipIncludeSchema'
import { MembershipWhereUniqueInputSchema } from '../inputTypeSchemas/MembershipWhereUniqueInputSchema'
import { MembershipCreateInputSchema } from '../inputTypeSchemas/MembershipCreateInputSchema'
import { MembershipUncheckedCreateInputSchema } from '../inputTypeSchemas/MembershipUncheckedCreateInputSchema'
import { MembershipUpdateInputSchema } from '../inputTypeSchemas/MembershipUpdateInputSchema'
import { MembershipUncheckedUpdateInputSchema } from '../inputTypeSchemas/MembershipUncheckedUpdateInputSchema'
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

export const MembershipUpsertArgsSchema: z.ZodType<Prisma.MembershipUpsertArgs> = z.object({
  select: MembershipSelectSchema.optional(),
  include: z.lazy(() => MembershipIncludeSchema).optional(),
  where: MembershipWhereUniqueInputSchema,
  create: z.union([ MembershipCreateInputSchema,MembershipUncheckedCreateInputSchema ]),
  update: z.union([ MembershipUpdateInputSchema,MembershipUncheckedUpdateInputSchema ]),
}).strict() ;

export default MembershipUpsertArgsSchema;
