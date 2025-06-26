import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommunityCreateWithoutMembershipsInputSchema } from './CommunityCreateWithoutMembershipsInputSchema';
import { CommunityUncheckedCreateWithoutMembershipsInputSchema } from './CommunityUncheckedCreateWithoutMembershipsInputSchema';
import { CommunityCreateOrConnectWithoutMembershipsInputSchema } from './CommunityCreateOrConnectWithoutMembershipsInputSchema';
import { CommunityUpsertWithoutMembershipsInputSchema } from './CommunityUpsertWithoutMembershipsInputSchema';
import { CommunityWhereUniqueInputSchema } from './CommunityWhereUniqueInputSchema';
import { CommunityUpdateToOneWithWhereWithoutMembershipsInputSchema } from './CommunityUpdateToOneWithWhereWithoutMembershipsInputSchema';
import { CommunityUpdateWithoutMembershipsInputSchema } from './CommunityUpdateWithoutMembershipsInputSchema';
import { CommunityUncheckedUpdateWithoutMembershipsInputSchema } from './CommunityUncheckedUpdateWithoutMembershipsInputSchema';

export const CommunityUpdateOneRequiredWithoutMembershipsNestedInputSchema: z.ZodType<Prisma.CommunityUpdateOneRequiredWithoutMembershipsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommunityCreateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedCreateWithoutMembershipsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommunityCreateOrConnectWithoutMembershipsInputSchema).optional(),
  upsert: z.lazy(() => CommunityUpsertWithoutMembershipsInputSchema).optional(),
  connect: z.lazy(() => CommunityWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommunityUpdateToOneWithWhereWithoutMembershipsInputSchema),z.lazy(() => CommunityUpdateWithoutMembershipsInputSchema),z.lazy(() => CommunityUncheckedUpdateWithoutMembershipsInputSchema) ]).optional(),
}).strict();

export default CommunityUpdateOneRequiredWithoutMembershipsNestedInputSchema;
