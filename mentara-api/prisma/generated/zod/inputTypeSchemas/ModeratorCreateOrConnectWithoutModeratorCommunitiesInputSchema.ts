import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereUniqueInputSchema } from './ModeratorWhereUniqueInputSchema';
import { ModeratorCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema';

export const ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.ModeratorCreateOrConnectWithoutModeratorCommunitiesInput> = z.object({
  where: z.lazy(() => ModeratorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ModeratorCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]),
}).strict();

export default ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema;
