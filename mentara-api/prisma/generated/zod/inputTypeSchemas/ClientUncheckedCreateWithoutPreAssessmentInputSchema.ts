import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetUncheckedCreateNestedManyWithoutClientInputSchema } from './WorksheetUncheckedCreateNestedManyWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema } from './ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema';
import { MeetingUncheckedCreateNestedManyWithoutClientInputSchema } from './MeetingUncheckedCreateNestedManyWithoutClientInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutClientInputSchema } from './ReviewUncheckedCreateNestedManyWithoutClientInputSchema';

export const ClientUncheckedCreateWithoutPreAssessmentInputSchema: z.ZodType<Prisma.ClientUncheckedCreateWithoutPreAssessmentInput> = z.object({
  userId: z.string(),
  hasSeenTherapistRecommendations: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  worksheets: z.lazy(() => WorksheetUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  meetings: z.lazy(() => MeetingUncheckedCreateNestedManyWithoutClientInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutClientInputSchema).optional()
}).strict();

export default ClientUncheckedCreateWithoutPreAssessmentInputSchema;
