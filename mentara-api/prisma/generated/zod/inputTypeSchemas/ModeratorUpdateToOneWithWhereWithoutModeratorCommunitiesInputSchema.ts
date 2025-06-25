import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { ModeratorUpdateWithoutModeratorCommunitiesInputSchema } from './ModeratorUpdateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema';

export const ModeratorUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.ModeratorUpdateToOneWithWhereWithoutModeratorCommunitiesInput> = z.object({
  where: z.lazy(() => ModeratorWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ModeratorUpdateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema) ]),
}).strict();

export default ModeratorUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema;
