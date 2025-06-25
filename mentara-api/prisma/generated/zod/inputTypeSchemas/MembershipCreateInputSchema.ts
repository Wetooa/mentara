import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateNestedOneWithoutMembershipsInputSchema } from './CommunityCreateNestedOneWithoutMembershipsInputSchema';
import { UserCreateNestedOneWithoutMembershipsInputSchema } from './UserCreateNestedOneWithoutMembershipsInputSchema';

export const MembershipCreateInputSchema: z.ZodType<Prisma.MembershipCreateInput> = z.object({
  id: z.string().uuid().optional(),
  role: z.string().optional(),
  joinedAt: z.coerce.date().optional(),
  community: z.lazy(() => CommunityCreateNestedOneWithoutMembershipsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutMembershipsInputSchema).optional()
}).strict();

export default MembershipCreateInputSchema;
