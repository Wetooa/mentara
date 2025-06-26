import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutClientNestedInputSchema } from './UserUpdateOneRequiredWithoutClientNestedInputSchema';
import { PreAssessmentUpdateOneWithoutClientNestedInputSchema } from './PreAssessmentUpdateOneWithoutClientNestedInputSchema';
import { WorksheetSubmissionUpdateManyWithoutClientNestedInputSchema } from './WorksheetSubmissionUpdateManyWithoutClientNestedInputSchema';
import { ClientMedicalHistoryUpdateManyWithoutClientNestedInputSchema } from './ClientMedicalHistoryUpdateManyWithoutClientNestedInputSchema';
import { ClientPreferenceUpdateManyWithoutClientNestedInputSchema } from './ClientPreferenceUpdateManyWithoutClientNestedInputSchema';
import { ClientTherapistUpdateManyWithoutClientNestedInputSchema } from './ClientTherapistUpdateManyWithoutClientNestedInputSchema';
import { MeetingUpdateManyWithoutClientNestedInputSchema } from './MeetingUpdateManyWithoutClientNestedInputSchema';
import { ReviewUpdateManyWithoutClientNestedInputSchema } from './ReviewUpdateManyWithoutClientNestedInputSchema';

export const ClientUpdateWithoutWorksheetsInputSchema: z.ZodType<Prisma.ClientUpdateWithoutWorksheetsInput> = z.object({
  hasSeenTherapistRecommendations: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutClientNestedInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentUpdateOneWithoutClientNestedInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionUpdateManyWithoutClientNestedInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryUpdateManyWithoutClientNestedInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceUpdateManyWithoutClientNestedInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistUpdateManyWithoutClientNestedInputSchema).optional(),
  meetings: z.lazy(() => MeetingUpdateManyWithoutClientNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutClientNestedInputSchema).optional()
}).strict();

export default ClientUpdateWithoutWorksheetsInputSchema;
