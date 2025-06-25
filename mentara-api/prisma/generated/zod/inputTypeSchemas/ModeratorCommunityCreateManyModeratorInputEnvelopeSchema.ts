import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCommunityCreateManyModeratorInputSchema } from './ModeratorCommunityCreateManyModeratorInputSchema';

export const ModeratorCommunityCreateManyModeratorInputEnvelopeSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyModeratorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ModeratorCommunityCreateManyModeratorInputSchema),z.lazy(() => ModeratorCommunityCreateManyModeratorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ModeratorCommunityCreateManyModeratorInputEnvelopeSchema;
