import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutClientNestedInputSchema } from './UserUpdateOneRequiredWithoutClientNestedInputSchema';
import { WorksheetUpdateManyWithoutClientNestedInputSchema } from './WorksheetUpdateManyWithoutClientNestedInputSchema';
import { PreAssessmentUpdateOneWithoutClientNestedInputSchema } from './PreAssessmentUpdateOneWithoutClientNestedInputSchema';
import { WorksheetSubmissionUpdateManyWithoutClientNestedInputSchema } from './WorksheetSubmissionUpdateManyWithoutClientNestedInputSchema';
import { ClientPreferenceUpdateManyWithoutClientNestedInputSchema } from './ClientPreferenceUpdateManyWithoutClientNestedInputSchema';
import { ClientTherapistUpdateManyWithoutClientNestedInputSchema } from './ClientTherapistUpdateManyWithoutClientNestedInputSchema';
import { MeetingUpdateManyWithoutClientNestedInputSchema } from './MeetingUpdateManyWithoutClientNestedInputSchema';
import { ReviewUpdateManyWithoutClientNestedInputSchema } from './ReviewUpdateManyWithoutClientNestedInputSchema';

export const ClientUpdateWithoutClientMedicalHistoryInputSchema: z.ZodType<Prisma.ClientUpdateWithoutClientMedicalHistoryInput> = z.object({
  hasSeenTherapistRecommendations: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutClientNestedInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetUpdateManyWithoutClientNestedInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentUpdateOneWithoutClientNestedInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionUpdateManyWithoutClientNestedInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceUpdateManyWithoutClientNestedInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistUpdateManyWithoutClientNestedInputSchema).optional(),
  meetings: z.lazy(() => MeetingUpdateManyWithoutClientNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutClientNestedInputSchema).optional()
}).strict();

export default ClientUpdateWithoutClientMedicalHistoryInputSchema;
