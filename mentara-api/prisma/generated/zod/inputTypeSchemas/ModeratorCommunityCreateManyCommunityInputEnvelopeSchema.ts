import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateManyCommunityInputSchema } from './ModeratorCommunityCreateManyCommunityInputSchema';

export const ModeratorCommunityCreateManyCommunityInputEnvelopeSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyCommunityInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ModeratorCommunityCreateManyCommunityInputSchema),z.lazy(() => ModeratorCommunityCreateManyCommunityInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ModeratorCommunityCreateManyCommunityInputEnvelopeSchema;
