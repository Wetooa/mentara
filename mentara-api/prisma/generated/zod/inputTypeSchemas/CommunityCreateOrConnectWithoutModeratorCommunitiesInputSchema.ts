import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';
import { CommunityCreateWithoutModeratorCommunitiesInputSchema } from './CommunityCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema';

export const CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.CommunityCreateOrConnectWithoutModeratorCommunitiesInput> = z.object({
  where: z.lazy(() => CommunityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommunityCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]),
}).strict();

export default CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema;
