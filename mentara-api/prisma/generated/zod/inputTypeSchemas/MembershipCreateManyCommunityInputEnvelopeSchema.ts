import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipCreateManyCommunityInputSchema } from './MembershipCreateManyCommunityInputSchema';

export const MembershipCreateManyCommunityInputEnvelopeSchema: z.ZodType<Prisma.MembershipCreateManyCommunityInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MembershipCreateManyCommunityInputSchema),z.lazy(() => MembershipCreateManyCommunityInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MembershipCreateManyCommunityInputEnvelopeSchema;
