import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityUpdateWithoutModeratorInputSchema } from './ModeratorCommunityUpdateWithoutModeratorInputSchema';
import { ModeratorCommunityUncheckedUpdateWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedUpdateWithoutModeratorInputSchema';

export const ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInput> = z.object({
  where: z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ModeratorCommunityUpdateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUncheckedUpdateWithoutModeratorInputSchema) ]),
}).strict();

export default ModeratorCommunityUpdateWithWhereUniqueWithoutModeratorInputSchema;
