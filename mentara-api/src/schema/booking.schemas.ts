import {
  MeetingCreateInputSchema,
  TherapistAvailabilityCreateInputSchema,
  MeetingUpdateInputSchema,
  TherapistAvailabilityUpdateInputSchema,
} from 'prisma/generated/zod/inputTypeSchemas';

import { z } from 'zod';

export type MeetingCreateDto = z.infer<typeof MeetingCreateInputSchema>;
export type MeetingUpdateDto = z.infer<typeof MeetingUpdateInputSchema>;
export type TherapistAvailabilityCreateDto = z.infer<
  typeof TherapistAvailabilityCreateInputSchema
>;
export type TherapistAvailabilityUpdateDto = z.infer<
  typeof TherapistAvailabilityUpdateInputSchema
>;
