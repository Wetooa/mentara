import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipScalarWhereInputSchema } from './MembershipScalarWhereInputSchema';
import { MembershipUpdateManyMutationInputSchema } from './MembershipUpdateManyMutationInputSchema';
import { MembershipUncheckedUpdateManyWithoutCommunityInputSchema } from './MembershipUncheckedUpdateManyWithoutCommunityInputSchema';

export const MembershipUpdateManyWithWhereWithoutCommunityInputSchema: z.ZodType<Prisma.MembershipUpdateManyWithWhereWithoutCommunityInput> = z.object({
  where: z.lazy(() => MembershipScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MembershipUpdateManyMutationInputSchema),z.lazy(() => MembershipUncheckedUpdateManyWithoutCommunityInputSchema) ]),
}).strict();

export default MembershipUpdateManyWithWhereWithoutCommunityInputSchema;
