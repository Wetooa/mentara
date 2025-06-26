import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { MeetingUpdateOneRequiredWithoutMeetingNotesNestedInputSchema } from './MeetingUpdateOneRequiredWithoutMeetingNotesNestedInputSchema';

export const MeetingNotesUpdateInputSchema: z.ZodType<Prisma.MeetingNotesUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  meeting: z.lazy(() => MeetingUpdateOneRequiredWithoutMeetingNotesNestedInputSchema).optional()
}).strict();

export default MeetingNotesUpdateInputSchema;
