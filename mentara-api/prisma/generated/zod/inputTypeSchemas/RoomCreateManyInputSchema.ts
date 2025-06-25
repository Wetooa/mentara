import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RoomCreateManyInputSchema: z.ZodType<Prisma.RoomCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  roomGroupId: z.string()
}).strict();

export default RoomCreateManyInputSchema;
