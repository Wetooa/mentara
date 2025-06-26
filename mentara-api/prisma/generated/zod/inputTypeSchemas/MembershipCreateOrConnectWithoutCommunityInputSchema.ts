import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipWhereUniqueInputSchema } from './MembershipWhereUniqueInputSchema';
import { MembershipCreateWithoutCommunityInputSchema } from './MembershipCreateWithoutCommunityInputSchema';
import { MembershipUncheckedCreateWithoutCommunityInputSchema } from './MembershipUncheckedCreateWithoutCommunityInputSchema';

export const MembershipCreateOrConnectWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipCreateOrConnectWithoutCommunityInput> = z.object({
  where: z.lazy(() => MembershipWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MembershipCreateWithoutCommunityInputSchema),z.lazy(() => MembershipUncheckedCreateWithoutCommunityInputSchema) ]),
}).strict();

export default MembershipCreateOrConnectWithoutCommunityInputSchema;
