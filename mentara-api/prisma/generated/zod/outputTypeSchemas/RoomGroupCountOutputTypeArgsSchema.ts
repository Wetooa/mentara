import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupCountOutputTypeSelectSchema } from './RoomGroupCountOutputTypeSelectSchema';

export const RoomGroupCountOutputTypeArgsSchema: z.ZodType<Prisma.RoomGroupCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => RoomGroupCountOutputTypeSelectSchema).nullish(),
}).strict();

export default RoomGroupCountOutputTypeSelectSchema;
