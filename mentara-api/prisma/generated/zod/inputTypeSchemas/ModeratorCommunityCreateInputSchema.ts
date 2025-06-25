import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema';
import { CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema } from './CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema';

export const ModeratorCommunityCreateInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateInput> = z.object({
  id: z.string().uuid().optional(),
  assignedAt: z.coerce.date().optional(),
  moderator: z.lazy(() => ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema),
  community: z.lazy(() => CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema)
}).strict();

export default ModeratorCommunityCreateInputSchema;
