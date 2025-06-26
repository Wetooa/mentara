import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';
import { CommunityUpdateWithoutMembershipsInputSchema } from './CommunityUpdateWithoutMembershipsInputSchema';
import { CommunityUncheckedUpdateWithoutMembershipsInputSchema } from './CommunityUncheckedUpdateWithoutMembershipsInputSchema';

export const CommunityUpdateToOneWithWhereWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityUpdateToOneWithWhereWithoutMembershipsInput> = z.object({
  where: z.lazy(() => CommunityWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommunityUpdateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutMembershipsInputSchema) ]),
}).strict();

export default CommunityUpdateToOneWithWhereWithoutMembershipsInputSchema;
