import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema';
import { ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema } from './ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema';
import { ModeratorUpsertWithoutModeratorCommunitiesInputSchema } from './ModeratorUpsertWithoutModeratorCommunitiesInputSchema';
import { ModeratorWhereUniqueInputSchema } from './ModeratorWhereUniqueInputSchema';
import { ModeratorUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema } from './ModeratorUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema';
import { ModeratorUpdateWithoutModeratorCommunitiesInputSchema } from './ModeratorUpdateWithoutModeratorCommunitiesInputSchema';
import { ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema } from './ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema';

export const ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema: z.ZodType<Prisma.ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCreateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutModeratorCommunitiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ModeratorCreateOrConnectWithoutModeratorCommunitiesInputSchema).optional(),
  upsert: z.lazy(() => ModeratorUpsertWithoutModeratorCommunitiesInputSchema).optional(),
  connect: z.lazy(() => ModeratorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ModeratorUpdateToOneWithWhereWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUpdateWithoutModeratorCommunitiesInputSchema),z.lazy(() => ModeratorUncheckedUpdateWithoutModeratorCommunitiesInputSchema) ]).optional(),
}).strict();

export default ModeratorUpdateOneRequiredWithoutModeratorCommunitiesNestedInputSchema;
