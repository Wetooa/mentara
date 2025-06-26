import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityUpdateWithoutModeratorInputSchema } from './ModeratorCommunityUpdateWithoutModeratorInputSchema';
import { ModeratorCommunityUncheckedUpdateWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedUpdateWithoutModeratorInputSchema';
import { ModeratorCommunityCreateWithoutModeratorInputSchema } from './ModeratorCommunityCreateWithoutModeratorInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema';

export const ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInput> = z.object({
  where: z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ModeratorCommunityUpdateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUncheckedUpdateWithoutModeratorInputSchema) ]),
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema) ]),
}).strict();

export default ModeratorCommunityUpsertWithWhereUniqueWithoutModeratorInputSchema;
