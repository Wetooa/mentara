import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';

export const EnumMeetingStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumMeetingStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => MeetingStatusSchema).optional()
}).strict();

export default EnumMeetingStatusFieldUpdateOperationsInputSchema;
