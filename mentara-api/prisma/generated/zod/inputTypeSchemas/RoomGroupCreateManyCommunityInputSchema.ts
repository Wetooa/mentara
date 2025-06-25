import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RoomGroupCreateManyCommunityInputSchema: z.ZodType<Prisma.RoomGroupCreateManyCommunityInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int()
}).strict();

export default RoomGroupCreateManyCommunityInputSchema;
