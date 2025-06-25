import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { WorksheetUncheckedUpdateManyWithoutClientNestedInputSchema } from './WorksheetUncheckedUpdateManyWithoutClientNestedInputSchema';
import { PreAssessmentUncheckedUpdateOneWithoutClientNestedInputSchema } from './PreAssessmentUncheckedUpdateOneWithoutClientNestedInputSchema';
import { WorksheetSubmissionUncheckedUpdateManyWithoutClientNestedInputSchema } from './WorksheetSubmissionUncheckedUpdateManyWithoutClientNestedInputSchema';
import { ClientMedicalHistoryUncheckedUpdateManyWithoutClientNestedInputSchema } from './ClientMedicalHistoryUncheckedUpdateManyWithoutClientNestedInputSchema';
import { ClientTherapistUncheckedUpdateManyWithoutClientNestedInputSchema } from './ClientTherapistUncheckedUpdateManyWithoutClientNestedInputSchema';
import { MeetingUncheckedUpdateManyWithoutClientNestedInputSchema } from './MeetingUncheckedUpdateManyWithoutClientNestedInputSchema';

export const ClientUncheckedUpdateWithoutClientPreferencesInputSchema: z.ZodType<Prisma.ClientUncheckedUpdateWithoutClientPreferencesInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hasSeenTherapistRecommendations: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  worksheets: z.lazy(() => WorksheetUncheckedUpdateManyWithoutClientNestedInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentUncheckedUpdateOneWithoutClientNestedInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionUncheckedUpdateManyWithoutClientNestedInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryUncheckedUpdateManyWithoutClientNestedInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistUncheckedUpdateManyWithoutClientNestedInputSchema).optional(),
  meetings: z.lazy(() => MeetingUncheckedUpdateManyWithoutClientNestedInputSchema).optional()
}).strict();

export default ClientUncheckedUpdateWithoutClientPreferencesInputSchema;
