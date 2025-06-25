import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityUpdateWithoutCommunityInputSchema } from './ModeratorCommunityUpdateWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedUpdateWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedUpdateWithoutCommunityInputSchema';
import { ModeratorCommunityCreateWithoutCommunityInputSchema } from './ModeratorCommunityCreateWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema';

export const ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInput> = z.object({
  where: z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ModeratorCommunityUpdateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUncheckedUpdateWithoutCommunityInputSchema) ]),
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema) ]),
}).strict();

export default ModeratorCommunityUpsertWithWhereUniqueWithoutCommunityInputSchema;
