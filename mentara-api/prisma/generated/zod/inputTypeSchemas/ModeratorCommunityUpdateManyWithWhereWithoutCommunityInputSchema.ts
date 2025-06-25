import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityScalarWhereInputSchema } from './ModeratorCommunityScalarWhereInputSchema';
import { ModeratorCommunityUpdateManyMutationInputSchema } from './ModeratorCommunityUpdateManyMutationInputSchema';
import { ModeratorCommunityUncheckedUpdateManyWithoutCommunityInputSchema } from './ModeratorCommunityUncheckedUpdateManyWithoutCommunityInputSchema';

export const ModeratorCommunityUpdateManyWithWhereWithoutCommunityInputSchema: z.ZodType<Prisma.ModeratorCommunityUpdateManyWithWhereWithoutCommunityInput> = z.object({
  where: z.lazy(() => ModeratorCommunityScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ModeratorCommunityUpdateManyMutationInputSchema),z.lazy(() => ModeratorCommunityUncheckedUpdateManyWithoutCommunityInputSchema) ]),
}).strict();

export default ModeratorCommunityUpdateManyWithWhereWithoutCommunityInputSchema;
