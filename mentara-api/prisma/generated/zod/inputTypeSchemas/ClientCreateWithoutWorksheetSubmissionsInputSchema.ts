import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutClientInputSchema } from './UserCreateNestedOneWithoutClientInputSchema';
import { WorksheetCreateNestedManyWithoutClientInputSchema } from './WorksheetCreateNestedManyWithoutClientInputSchema';
import { PreAssessmentCreateNestedOneWithoutClientInputSchema } from './PreAssessmentCreateNestedOneWithoutClientInputSchema';
import { ClientMedicalHistoryCreateNestedManyWithoutClientInputSchema } from './ClientMedicalHistoryCreateNestedManyWithoutClientInputSchema';
import { ClientPreferenceCreateNestedManyWithoutClientInputSchema } from './ClientPreferenceCreateNestedManyWithoutClientInputSchema';
import { ClientTherapistCreateNestedManyWithoutClientInputSchema } from './ClientTherapistCreateNestedManyWithoutClientInputSchema';
import { MeetingCreateNestedManyWithoutClientInputSchema } from './MeetingCreateNestedManyWithoutClientInputSchema';
import { ReviewCreateNestedManyWithoutClientInputSchema } from './ReviewCreateNestedManyWithoutClientInputSchema';

export const ClientCreateWithoutWorksheetSubmissionsInputSchema: z.ZodType<Prisma.ClientCreateWithoutWorksheetSubmissionsInput> = z.object({
  hasSeenTherapistRecommendations: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutClientInputSchema),
  worksheets: z.lazy(() => WorksheetCreateNestedManyWithoutClientInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentCreateNestedOneWithoutClientInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryCreateNestedManyWithoutClientInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceCreateNestedManyWithoutClientInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistCreateNestedManyWithoutClientInputSchema).optional(),
  meetings: z.lazy(() => MeetingCreateNestedManyWithoutClientInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutClientInputSchema).optional()
}).strict();

export default ClientCreateWithoutWorksheetSubmissionsInputSchema;
