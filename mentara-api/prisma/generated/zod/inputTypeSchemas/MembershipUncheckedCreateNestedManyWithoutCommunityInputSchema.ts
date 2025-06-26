import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipCreateWithoutCommunityInputSchema } from './MembershipCreateWithoutCommunityInputSchema';
import { MembershipUncheckedCreateWithoutCommunityInputSchema } from './MembershipUncheckedCreateWithoutCommunityInputSchema';
import { MembershipCreateOrConnectWithoutCommunityInputSchema } from './MembershipCreateOrConnectWithoutCommunityInputSchema';
import { MembershipCreateManyCommunityInputEnvelopeSchema } from './MembershipCreateManyCommunityInputEnvelopeSchema';
import { MembershipWhereUniqueInputSchema } from './MembershipWhereUniqueInputSchema';

export const MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipUncheckedCreateNestedManyWithoutCommunityInput> = z.object({
  create: z.union([ z.lazy(() => MembershipCreateWithoutCommunityInputSchema),z.lazy(() => MembershipCreateWithoutCommunityInputSchema).array(),z.lazy(() => MembershipUncheckedCreateWithoutCommunityInputSchema),z.lazy(() => MembershipUncheckedCreateWithoutCommunityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MembershipCreateOrConnectWithoutCommunityInputSchema),z.lazy(() => MembershipCreateOrConnectWithoutCommunityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MembershipCreateManyCommunityInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MembershipWhereUniqueInputSchema),z.lazy(() => MembershipWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MembershipUncheckedCreateNestedManyWithoutCommunityInputSchema;
