import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { EnumMeetingStatusFieldUpdateOperationsInputSchema } from './EnumMeetingStatusFieldUpdateOperationsInputSchema';
import { MeetingNotesUncheckedUpdateManyWithoutMeetingNestedInputSchema } from './MeetingNotesUncheckedUpdateManyWithoutMeetingNestedInputSchema';
import { ReviewUncheckedUpdateManyWithoutMeetingNestedInputSchema } from './ReviewUncheckedUpdateManyWithoutMeetingNestedInputSchema';

export const MeetingUncheckedUpdateWithoutClientInputSchema: z.ZodType<Prisma.MeetingUncheckedUpdateWithoutClientInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  startTime: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  duration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => MeetingStatusSchema),z.lazy(() => EnumMeetingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  meetingType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  meetingUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  therapistId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  meetingNotes: z.lazy(() => MeetingNotesUncheckedUpdateManyWithoutMeetingNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutMeetingNestedInputSchema).optional()
}).strict();

export default MeetingUncheckedUpdateWithoutClientInputSchema;
