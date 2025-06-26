import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateWithoutMembershipsInputSchema } from './CommunityCreateWithoutMembershipsInputSchema';
import { CommunityUncheckedCreateWithoutMembershipsInputSchema } from './CommunityUncheckedCreateWithoutMembershipsInputSchema';
import { CommunityCreateOrConnectWithoutMembershipsInputSchema } from './CommunityCreateOrConnectWithoutMembershipsInputSchema';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';

export const CommunityCreateNestedOneWithoutMembershipsInputSchema: z.ZodType<Prisma.CommunityCreateNestedOneWithoutMembershipsInput> = z.object({
  create: z.union([ z.lazy(() => CommunityCreateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutMembershipsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommunityCreateOrConnectWithoutMembershipsInputSchema).optional(),
  connect: z.lazy(() => CommunityWhereUniqueInputSchema).optional()
}).strict();

export default CommunityCreateNestedOneWithoutMembershipsInputSchema;
