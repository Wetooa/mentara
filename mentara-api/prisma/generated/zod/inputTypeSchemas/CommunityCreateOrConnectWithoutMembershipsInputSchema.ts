import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';
import { CommunityCreateWithoutMembershipsInputSchema } from './CommunityCreateWithoutMembershipsInputSchema';
import { CommunityUncheckedCreateWithoutMembershipsInputSchema } from './CommunityUncheckedCreateWithoutMembershipsInputSchema';

export const CommunityCreateOrConnectWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityCreateOrConnectWithoutMembershipsInput> = z.object({
  where: z.lazy(() => CommunityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommunityCreateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutMembershipsInputSchema) ]),
}).strict();

export default CommunityCreateOrConnectWithoutMembershipsInputSchema;
