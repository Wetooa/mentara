import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema } from './CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema';

export const ModeratorCommunityCreateWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateWithoutModeratorInput> = z.object({
  id: z.string().uuid().optional(),
  assignedAt: z.coerce.date().optional(),
  community: z.lazy(() => CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema)
}).strict();

export default ModeratorCommunityCreateWithoutModeratorInputSchema;
