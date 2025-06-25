import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MembershipCreateManyInputSchema: z.ZodType<Prisma.MembershipCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  communityId: z.string(),
  role: z.string().optional(),
  joinedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export default MembershipCreateManyInputSchema;
