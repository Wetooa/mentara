import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateareasOfExpertiseInputSchema } from './TherapistCreateareasOfExpertiseInputSchema';
import { TherapistCreateassessmentToolsInputSchema } from './TherapistCreateassessmentToolsInputSchema';
import { TherapistCreatetherapeuticApproachesUsedListInputSchema } from './TherapistCreatetherapeuticApproachesUsedListInputSchema';
import { TherapistCreatelanguagesOfferedInputSchema } from './TherapistCreatelanguagesOfferedInputSchema';
import { TherapistCreatepreferredSessionLengthInputSchema } from './TherapistCreatepreferredSessionLengthInputSchema';
import { TherapistCreateexpertiseInputSchema } from './TherapistCreateexpertiseInputSchema';
import { TherapistCreateapproachesInputSchema } from './TherapistCreateapproachesInputSchema';
import { TherapistCreatelanguagesInputSchema } from './TherapistCreatelanguagesInputSchema';
import { TherapistCreateillnessSpecializationsInputSchema } from './TherapistCreateillnessSpecializationsInputSchema';
import { TherapistCreateacceptTypesInputSchema } from './TherapistCreateacceptTypesInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { UserCreateNestedOneWithoutTherapistInputSchema } from './UserCreateNestedOneWithoutTherapistInputSchema';
import { AdminCreateNestedOneWithoutProcessedTherapistsInputSchema } from './AdminCreateNestedOneWithoutProcessedTherapistsInputSchema';
import { TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema } from './TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema';
import { WorksheetCreateNestedManyWithoutTherapistInputSchema } from './WorksheetCreateNestedManyWithoutTherapistInputSchema';
import { ClientTherapistCreateNestedManyWithoutTherapistInputSchema } from './ClientTherapistCreateNestedManyWithoutTherapistInputSchema';
import { ReviewCreateNestedManyWithoutTherapistInputSchema } from './ReviewCreateNestedManyWithoutTherapistInputSchema';
import { TherapistFilesCreateNestedManyWithoutTherapistInputSchema } from './TherapistFilesCreateNestedManyWithoutTherapistInputSchema';

export const TherapistCreateWithoutMeetingsInputSchema: z.ZodType<Prisma.TherapistCreateWithoutMeetingsInput> = z.object({
  mobile: z.string(),
  province: z.string(),
  status: z.string().optional(),
  submissionDate: z.coerce.date().optional(),
  processingDate: z.coerce.date().optional(),
  providerType: z.string(),
  professionalLicenseType: z.string(),
  isPRCLicensed: z.string(),
  prcLicenseNumber: z.string(),
  expirationDateOfLicense: z.coerce.date(),
  practiceStartDate: z.coerce.date(),
  areasOfExpertise: z.union([ z.lazy(() => TherapistCreateareasOfExpertiseInputSchema),z.string().array() ]).optional(),
  assessmentTools: z.union([ z.lazy(() => TherapistCreateassessmentToolsInputSchema),z.string().array() ]).optional(),
  therapeuticApproachesUsedList: z.union([ z.lazy(() => TherapistCreatetherapeuticApproachesUsedListInputSchema),z.string().array() ]).optional(),
  languagesOffered: z.union([ z.lazy(() => TherapistCreatelanguagesOfferedInputSchema),z.string().array() ]).optional(),
  providedOnlineTherapyBefore: z.boolean(),
  comfortableUsingVideoConferencing: z.boolean(),
  preferredSessionLength: z.union([ z.lazy(() => TherapistCreatepreferredSessionLengthInputSchema),z.number().int().array() ]).optional(),
  privateConfidentialSpace: z.string().optional().nullable(),
  compliesWithDataPrivacyAct: z.boolean(),
  professionalLiabilityInsurance: z.string().optional().nullable(),
  complaintsOrDisciplinaryActions: z.string().optional().nullable(),
  willingToAbideByPlatformGuidelines: z.boolean(),
  expertise: z.union([ z.lazy(() => TherapistCreateexpertiseInputSchema),z.string().array() ]).optional(),
  approaches: z.union([ z.lazy(() => TherapistCreateapproachesInputSchema),z.string().array() ]).optional(),
  languages: z.union([ z.lazy(() => TherapistCreatelanguagesInputSchema),z.string().array() ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => TherapistCreateillnessSpecializationsInputSchema),z.string().array() ]).optional(),
  acceptTypes: z.union([ z.lazy(() => TherapistCreateacceptTypesInputSchema),z.string().array() ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  sessionLength: z.string(),
  hourlyRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutTherapistInputSchema),
  processedByAdmin: z.lazy(() => AdminCreateNestedOneWithoutProcessedTherapistsInputSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetCreateNestedManyWithoutTherapistInputSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistCreateNestedManyWithoutTherapistInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutTherapistInputSchema).optional(),
  therapistFiles: z.lazy(() => TherapistFilesCreateNestedManyWithoutTherapistInputSchema).optional()
}).strict();

export default TherapistCreateWithoutMeetingsInputSchema;
