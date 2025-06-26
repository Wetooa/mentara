import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateWithoutModeratorInputSchema } from './ModeratorCommunityCreateWithoutModeratorInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema';
import { ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema } from './ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema';
import { ModeratorCommunityCreateManyModeratorInputEnvelopeSchema } from './ModeratorCommunityCreateManyModeratorInputEnvelopeSchema';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';

export const ModeratorCommunityUncheckedCreateNestedManyWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityUncheckedCreateNestedManyWithoutModeratorInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityCreateWithoutModeratorInputSchema).array(),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutModeratorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema),z.lazy(() => ModeratorCommunityCreateOrConnectWithoutModeratorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ModeratorCommunityCreateManyModeratorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),z.lazy(() => ModeratorCommunityWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ModeratorCommunityUncheckedCreateNestedManyWithoutModeratorInputSchema;
