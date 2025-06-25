import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetUncheckedCreateNestedManyWithoutClientInputSchema } from './WorksheetUncheckedCreateNestedManyWithoutClientInputSchema';
import { PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema } from './PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema';
import { MeetingUncheckedCreateNestedManyWithoutClientInputSchema } from './MeetingUncheckedCreateNestedManyWithoutClientInputSchema';

export const ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema: z.ZodType<Prisma.ClientUncheckedCreateWithoutClientMedicalHistoryInput> = z.object({
  userId: z.string(),
  hasSeenTherapistRecommendations: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  worksheets: z.lazy(() => WorksheetUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  meetings: z.lazy(() => MeetingUncheckedCreateNestedManyWithoutClientInputSchema).optional()
}).strict();

export default ClientUncheckedCreateWithoutClientMedicalHistoryInputSchema;
