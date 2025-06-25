import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutClientInputSchema } from './UserCreateNestedOneWithoutClientInputSchema';
import { WorksheetCreateNestedManyWithoutClientInputSchema } from './WorksheetCreateNestedManyWithoutClientInputSchema';
import { PreAssessmentCreateNestedOneWithoutClientInputSchema } from './PreAssessmentCreateNestedOneWithoutClientInputSchema';
import { WorksheetSubmissionCreateNestedManyWithoutClientInputSchema } from './WorksheetSubmissionCreateNestedManyWithoutClientInputSchema';
import { ClientMedicalHistoryCreateNestedManyWithoutClientInputSchema } from './ClientMedicalHistoryCreateNestedManyWithoutClientInputSchema';
import { ClientPreferenceCreateNestedManyWithoutClientInputSchema } from './ClientPreferenceCreateNestedManyWithoutClientInputSchema';
import { MeetingCreateNestedManyWithoutClientInputSchema } from './MeetingCreateNestedManyWithoutClientInputSchema';

export const ClientCreateWithoutAssignedTherapistsInputSchema: z.ZodType<Prisma.ClientCreateWithoutAssignedTherapistsInput> = z.object({
  hasSeenTherapistRecommendations: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutClientInputSchema),
  worksheets: z.lazy(() => WorksheetCreateNestedManyWithoutClientInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentCreateNestedOneWithoutClientInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionCreateNestedManyWithoutClientInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryCreateNestedManyWithoutClientInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceCreateNestedManyWithoutClientInputSchema).optional(),
  meetings: z.lazy(() => MeetingCreateNestedManyWithoutClientInputSchema).optional()
}).strict();

export default ClientCreateWithoutAssignedTherapistsInputSchema;
