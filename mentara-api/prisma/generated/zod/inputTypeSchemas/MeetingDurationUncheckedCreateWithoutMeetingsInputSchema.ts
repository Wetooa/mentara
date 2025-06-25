import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MeetingDurationUncheckedCreateWithoutMeetingsInputSchema: z.ZodType<Prisma.MeetingDurationUncheckedCreateWithoutMeetingsInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  duration: z.number().int(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingDurationUncheckedCreateWithoutMeetingsInputSchema;
