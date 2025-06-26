import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';
import { CommunityUpdateWithoutModeratorCommunitiesInputSchema } from './CommunityUpdateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema';

export const CommunityUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.CommunityUpdateToOneWithWhereWithoutModeratorCommunitiesInput> = z.object({
  where: z.lazy(() => CommunityWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommunityUpdateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema) ]),
}).strict();

export default CommunityUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema;
