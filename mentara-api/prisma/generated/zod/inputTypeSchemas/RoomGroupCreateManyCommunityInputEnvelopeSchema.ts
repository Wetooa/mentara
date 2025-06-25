import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupCreateManyCommunityInputSchema } from './RoomGroupCreateManyCommunityInputSchema';

export const RoomGroupCreateManyCommunityInputEnvelopeSchema: z.ZodType<Prisma.RoomGroupCreateManyCommunityInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RoomGroupCreateManyCommunityInputSchema),z.lazy(() => RoomGroupCreateManyCommunityInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RoomGroupCreateManyCommunityInputEnvelopeSchema;
