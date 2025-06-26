import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateNestedOneWithoutMembershipsInputSchema } from './CommunityCreateNestedOneWithoutMembershipsInputSchema';

export const MembershipCreateWithoutUserInputSchema: z.ZodType<Prisma.MembershipCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  role: z.string().optional(),
  joinedAt: z.coerce.date().optional(),
  community: z.lazy(() => CommunityCreateNestedOneWithoutMembershipsInputSchema)
}).strict();

export default MembershipCreateWithoutUserInputSchema;
