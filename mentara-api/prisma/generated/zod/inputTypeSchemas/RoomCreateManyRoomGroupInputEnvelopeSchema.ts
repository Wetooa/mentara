import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomCreateManyRoomGroupInputSchema } from './RoomCreateManyRoomGroupInputSchema';

export const RoomCreateManyRoomGroupInputEnvelopeSchema: z.ZodType<Prisma.RoomCreateManyRoomGroupInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RoomCreateManyRoomGroupInputSchema),z.lazy(() => RoomCreateManyRoomGroupInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RoomCreateManyRoomGroupInputEnvelopeSchema;
