import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityCreateWithoutModeratorInputSchema } from './ModeratorCommunityCreateWithoutModeratorInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema';

export const ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateOrConnectWithoutModeratorInput> = z.object({
  where: z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema) ]),
}).strict();

export default ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema;
