import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityWhereUniqueInputSchema } from './ModeratorCommunityWhereUniqueInputSchema';
import { ModeratorCommunityCreateWithoutCommunityInputSchema } from './ModeratorCommunityCreateWithoutCommunityInputSchema';
import { ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema';

export const ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityCreateOrConnectWithoutCommunityInput> = z.object({
  where: z.lazy(() => ModeratorCommunityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ModeratorCommunityCreateWithoutCommunityInputSchema),z.lazy(() => ModeratorCommunityUncheckedCreateWithoutCommunityInputSchema) ]),
}).strict();

export default ModeratorCommunityCreateOrConnectWithoutCommunityInputSchema;
