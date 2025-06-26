import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityScalarWhereInputSchema } from './ModeratorCommunityScalarWhereInputSchema';
import { ModeratorCommunityUpdateManyMutationInputSchema } from './ModeratorCommunityUpdateManyMutationInputSchema';
import { ModeratorCommunityUncheckedUpdateManyWithoutModeratorInputSchema } from './ModeratorCommunityUncheckedUpdateManyWithoutModeratorInputSchema';

export const ModeratorCommunityUpdateManyWithWhereWithoutModeratorInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateManyWithWhereWithoutModeratorInput> = z.object({
  where: z.lazy(() => ModeratorCommunityScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ModeratorCommunityUpdateManyMutationInputSchema),z.lazy(() => ModeratorCommunityUncheckedUpdateManyWithoutModeratorInputSchema) ]),
}).strict();

export default ModeratorCommunityUpdateManyWithWhereWithoutModeratorInputSchema;
