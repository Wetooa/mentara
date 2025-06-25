import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityUpdateWithoutMembershipsInputSchema } from './CommunityUpdateWithoutMembershipsInputSchema';
import { CommunityUncheckedUpdateWithoutMembershipsInputSchema } from './CommunityUncheckedUpdateWithoutMembershipsInputSchema';
import { CommunityCreateWithoutMembershipsInputSchema } from './CommunityCreateWithoutMembershipsInputSchema';
import { CommunityUncheckedCreateWithoutMembershipsInputSchema } from './CommunityUncheckedCreateWithoutMembershipsInputSchema';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';

export const CommunityUpsertWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityUpsertWithoutMembershipsInput> = z.object({
  update: z.union([ z.lazy(() => CommunityUpdateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutMembershipsInputSchema) ]),
  create: z.union([ z.lazy(() => CommunityCreateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutMembershipsInputSchema) ]),
  where: z.lazy(() => CommunityWhereInputSchema).optional()
}).strict();

export default CommunityUpsertWithoutMembershipsInputSchema;
