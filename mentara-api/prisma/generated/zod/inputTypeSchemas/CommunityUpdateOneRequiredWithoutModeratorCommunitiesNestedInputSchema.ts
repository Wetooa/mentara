import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateWithoutModeratorCommunitiesInputSchema } from './CommunityCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema';
import { CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema } from './CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema';
import { CommunityUpsertWithoutModeratorCommunitiesInputSchema } from './CommunityUpsertWithoutModeratorCommunitiesInputSchema';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';
import { CommunityUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema } from './CommunityUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema';
import { CommunityUpdateWithoutModeratorCommunitiesInputSchema } from './CommunityUpdateWithoutModeratorCommunitiesInputSchema';
import { CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema } from './CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema';

export const CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema: z.ZodType<Prisma.CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommunityCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommunityCreateOrConnectWithoutModeratorCommunitiesInputSchema).optional(),
  upsert: z.lazy(() => CommunityUpsertWithoutModeratorCommunitiesInputSchema).optional(),
  connect: z.lazy(() => CommunityWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommunityUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUpdateWithoutModeratorCommunitiesInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutModeratorCommunitiesInputSchema) ]).optional(),
}).strict();

export default CommunityUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema;
