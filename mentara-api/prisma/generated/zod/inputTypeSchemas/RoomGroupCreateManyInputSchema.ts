import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RoomGroupCreateManyInputSchema: z.ZodType<Prisma.RoomGroupCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  communityId: z.string()
}).strict();

export default RoomGroupCreateManyInputSchema;
