import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateWithoutModeratorCommunitiesInputSchema } from './CommunityCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema } from './CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';

export const CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.CommunityCreateNestedOneWithoutModeratorCommunitiesInput> = z.object({
  create: z.union([ z.lazy(() => CommunityCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema).optional(),
  connect: z.lazy(() => CommunityWhereUniqueInputSchema).optional()
}).strict();

export default CommunityCreateNestedOneWithoutModeratorCommunitiesInputSchema;
