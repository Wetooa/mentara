import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema';
import { ModeratorWhereUniqueInputSchema } from './ModeratorWhereUniqueInputSchema';

export const ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema: z.ZodType<Prisma.ModeratorCreateNestedOneWithoutModeratorCommunitiesInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema).optional(),
  connect: z.lazy(() => ModeratorWhereUniqueInputSchema).optional()
}).strict();

export default ModeratorCreateNestedOneWithoutModeratorCommunitiesInputSchema;
