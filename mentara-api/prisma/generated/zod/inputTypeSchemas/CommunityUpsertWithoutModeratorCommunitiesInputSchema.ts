import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityUpdateWithoutModeratorCommunitiesInputSchema } from './CommunityUpdateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema';
import { CommunityCreateWithoutModeratorCommunitiesInputSchema } from './CommunityCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';

export const CommunityUpsertWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.CommunityUpsertWithoutModeratorCommunitiesInput> = z.object({
  update: z.union([ z.lazy(() => CommunityUpdateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema) ]),
  create: z.union([ z.lazy(() => CommunityCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]),
  where: z.lazy(() => CommunityWhereInputSchema).optional()
}).strict();

export default CommunityUpsertWithoutModeratorCommunitiesInputSchema;
