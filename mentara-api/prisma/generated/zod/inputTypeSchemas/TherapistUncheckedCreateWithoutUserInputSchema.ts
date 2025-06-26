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
import { MeetingUncheckedCreateNestedManyWithoutTherapistInputSchema } from './MeetingUncheckedCreateNestedManyWithoutTherapistInputSchema';
import { TherapistAvailabilityUncheckedCreateNestedManyWithoutTherapistInputSchema } from './TherapistAvailabilityUncheckedCreateNestedManyWithoutTherapistInputSchema';
import { WorksheetUncheckedCreateNestedManyWithoutTherapistInputSchema } from './WorksheetUncheckedCreateNestedManyWithoutTherapistInputSchema';
import { ClientTherapistUncheckedCreateNestedManyWithoutTherapistInputSchema } from './ClientTherapistUncheckedCreateNestedManyWithoutTherapistInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutTherapistInputSchema } from './ReviewUncheckedCreateNestedManyWithoutTherapistInputSchema';
import { TherapistFilesUncheckedCreateNestedManyWithoutTherapistInputSchema } from './TherapistFilesUncheckedCreateNestedManyWithoutTherapistInputSchema';

export const TherapistUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.TherapistUncheckedCreateWithoutUserInput> = z.object({
  mobile: z.string(),
  province: z.string(),
  status: z.string().optional(),
  submissionDate: z.coerce.date().optional(),
  processingDate: z.coerce.date().optional(),
  processedByAdminId: z.string().optional().nullable(),
  providerType: z.string(),
  professionalLicenseType: z.string(),
  isPRCLicensed: z.string(),
  prcLicenseNumber: z.string(),
  expirationDateOfLicense: z.coerce.date(),
  practiceStartDate: z.coerce.date(),
<<<<<<< HEAD
  yearsOfExperience: z.string().optional().nullable(),
  areasOfExpertise: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  assessmentTools: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  therapeuticApproachesUsedList: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  languagesOffered: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  providedOnlineTherapyBefore: z.string(),
  comfortableUsingVideoConferencing: z.string(),
  weeklyAvailability: z.string(),
  preferredSessionLength: z.string(),
  accepts: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  privateConfidentialSpace: z.string().optional().nullable(),
  compliesWithDataPrivacyAct: z.string().optional().nullable(),
  professionalLiabilityInsurance: z.string().optional().nullable(),
  complaintsOrDisciplinaryActions: z.string().optional().nullable(),
  willingToAbideByPlatformGuidelines: z.string().optional().nullable(),
  expertise: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  approaches: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  languages: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  acceptTypes: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  uploadedFiles: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  sessionLength: z.string().optional().nullable(),
  hourlyRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  bio: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  profileComplete: z.boolean().optional(),
  isActive: z.boolean().optional(),
  patientSatisfaction: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  totalPatients: z.number().int().optional(),
=======
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
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  meetings: z.lazy(() => MeetingUncheckedCreateNestedManyWithoutTherapistInputSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityUncheckedCreateNestedManyWithoutTherapistInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetUncheckedCreateNestedManyWithoutTherapistInputSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistUncheckedCreateNestedManyWithoutTherapistInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutTherapistInputSchema).optional(),
  therapistFiles: z.lazy(() => TherapistFilesUncheckedCreateNestedManyWithoutTherapistInputSchema).optional()
}).strict();

export default TherapistUncheckedCreateWithoutUserInputSchema;
