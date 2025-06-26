import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const RoomGroupCountOutputTypeSelectSchema: z.ZodType<Prisma.RoomGroupCountOutputTypeSelect> = z.object({
  rooms: z.boolean().optional(),
}).strict();

export default RoomGroupCountOutputTypeSelectSchema;
