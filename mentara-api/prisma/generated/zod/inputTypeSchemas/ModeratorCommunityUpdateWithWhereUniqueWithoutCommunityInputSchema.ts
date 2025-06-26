import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityUpdateWithoutCommunityInputSchema } from './ModeratorCommunityUpdateWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedUpdateWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedUpdateWithoutCommunityInputSchema';

export const ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInput> = z.object({
  where: z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ModeratorCommunityUpdateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUncheckedUpdateWithoutCommunityInputSchema) ]),
}).strict();

export default ModeratorCommunityUpdateWithWhereUniqueWithoutCommunityInputSchema;
