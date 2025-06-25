import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipWhereUniqueInputSchema } from './MembershipWhereUniqueInputSchema';
import { MembershipUpdateWithoutCommunityInputSchema } from './MembershipUpdateWithoutCommunityInputSchema';
import { MembershipUncheckedUpdateWithoutCommunityInputSchema } from './MembershipUncheckedUpdateWithoutCommunityInputSchema';
import { MembershipCreateWithoutCommunityInputSchema } from './MembershipCreateWithoutCommunityInputSchema';
import { MembershipUncheckedCreateWithoutCommunityInputSchema } from './MembershipUncheckedCreateWithoutCommunityInputSchema';

export const MembershipUpsertWithWhereUniqueWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipUpsertWithWhereUniqueWithoutCommunityInput> = z.object({
  where: z.lazy(() => MembershipWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MembershipUpdateWithoutCommunityInputSchema),z.lazy(() => MembershipUncheckedUpdateWithoutCommunityInputSchema) ]),
  create: z.union([ z.lazy(() => MembershipCreateWithoutCommunityInputSchema),z.lazy(() => MembershipUncheckedCreateWithoutCommunityInputSchema) ]),
}).strict();

export default MembershipUpsertWithWhereUniqueWithoutCommunityInputSchema;
