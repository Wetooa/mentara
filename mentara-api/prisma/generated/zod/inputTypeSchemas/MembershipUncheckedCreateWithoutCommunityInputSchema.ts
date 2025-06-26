import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MembershipUncheckedCreateWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipUncheckedCreateWithoutCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  role: z.string().optional(),
  joinedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default MembershipUncheckedCreateWithoutCommunityInputSchema;
