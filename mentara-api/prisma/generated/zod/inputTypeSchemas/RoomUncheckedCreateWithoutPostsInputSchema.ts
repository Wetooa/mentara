import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const RoomUncheckedCreateWithoutPostsInputSchema: z.ZodType<Prisma.RoomUncheckedCreateWithoutPostsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  order: z.number().int(),
  roomGroupId: z.string()
}).strict();

export default RoomUncheckedCreateWithoutPostsInputSchema;
