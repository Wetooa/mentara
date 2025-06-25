import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema';

export const ModeratorCommunityCreateWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateWithoutCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  assignedAt: z.coerce.date().optional(),
  moderator: z.lazy(() => ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema)
}).strict();

export default ModeratorCommunityCreateWithoutCommunityInputSchema;
