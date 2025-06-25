import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MembershipCreateManyUserInputSchema: z.ZodType<Prisma.MembershipCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  communityId: z.string(),
  role: z.string().optional(),
  joinedAt: z.coerce.date().optional()
}).strict();

export default MembershipCreateManyUserInputSchema;
