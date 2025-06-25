import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const CommunityCountOutputTypeSelectSchema: z.ZodType<Prisma.CommunityCountOutputTypeSelect> = z.object({
  memberships: z.boolean().optional(),
  moderatorCommunities: z.boolean().optional(),
  roomGroups: z.boolean().optional(),
}).strict();

export default CommunityCountOutputTypeSelectSchema;
