import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorUpdateWithoutModeratorCommunitiesInputSchema } from './ModeratorUpdateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema';
import { ModeratorCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';

export const ModeratorUpsertWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.ModeratorUpsertWithoutModeratorCommunitiesInput> = z.object({
  update: z.union([ z.lazy(() => ModeratorUpdateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema) ]),
  create: z.union([ z.lazy(() => ModeratorCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]),
  where: z.lazy(() => ModeratorWhereInputSchema).optional()
}).strict();

export default ModeratorUpsertWithoutModeratorCommunitiesInputSchema;
