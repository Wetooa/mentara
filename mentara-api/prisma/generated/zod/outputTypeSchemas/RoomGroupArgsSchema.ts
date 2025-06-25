import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupSelectSchema } from '../inputTypeSchemas/RoomGroupSelectSchema';
import { RoomGroupIncludeSchema } from '../inputTypeSchemas/RoomGroupIncludeSchema';

export const RoomGroupArgsSchema: z.ZodType<Prisma.RoomGroupDefaultArgs> = z.object({
  select: z.lazy(() => RoomGroupSelectSchema).optional(),
  include: z.lazy(() => RoomGroupIncludeSchema).optional(),
}).strict();

export default RoomGroupArgsSchema;
