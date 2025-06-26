import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetUncheckedCreateNestedManyWithoutClientInputSchema } from './WorksheetUncheckedCreateNestedManyWithoutClientInputSchema';
import { PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema } from './PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema';
import { MeetingUncheckedCreateNestedManyWithoutClientInputSchema } from './MeetingUncheckedCreateNestedManyWithoutClientInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutClientInputSchema } from './ReviewUncheckedCreateNestedManyWithoutClientInputSchema';

export const ClientUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ClientUncheckedCreateWithoutUserInput> = z.object({
  hasSeenTherapistRecommendations: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  worksheets: z.lazy(() => WorksheetUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  meetings: z.lazy(() => MeetingUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutClientInputSchema).optional()
}).strict();

export default ClientUncheckedCreateWithoutUserInputSchema;
