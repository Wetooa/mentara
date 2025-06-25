import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutMembershipsInputSchema } from './UserCreateNestedOneWithoutMembershipsInputSchema';

export const MembershipCreateWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipCreateWithoutCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  role: z.string().optional(),
  joinedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutMembershipsInputSchema).optional()
}).strict();

export default MembershipCreateWithoutCommunityInputSchema;
