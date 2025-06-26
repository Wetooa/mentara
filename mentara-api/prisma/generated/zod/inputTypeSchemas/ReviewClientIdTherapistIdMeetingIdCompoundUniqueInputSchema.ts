import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema: z.ZodType<Prisma.ReviewClientIdTherapistIdMeetingIdCompoundUniqueInput> = z.object({
  clientId: z.string(),
  therapistId: z.string(),
  meetingId: z.string()
}).strict();

export default ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema;
