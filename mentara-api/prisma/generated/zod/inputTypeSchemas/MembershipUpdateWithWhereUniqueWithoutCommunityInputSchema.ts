import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipWhereUniqueInputSchema } from './MembershipWhereUniqueInputSchema';
import { MembershipUpdateWithoutCommunityInputSchema } from './MembershipUpdateWithoutCommunityInputSchema';
import { MembershipUncheckedUpdateWithoutCommunityInputSchema } from './MembershipUncheckedUpdateWithoutCommunityInputSchema';

export const MembershipUpdateWithWhereUniqueWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipUpdateWithWhereUniqueWithoutCommunityInput> = z.object({
  where: z.lazy(() => MembershipWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MembershipUpdateWithoutCommunityInputSchema),z.lazy(() => MembershipUncheckedUpdateWithoutCommunityInputSchema) ]),
}).strict();

export default MembershipUpdateWithWhereUniqueWithoutCommunityInputSchema;
