import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { TherapistUpdateareasOfExpertiseInputSchema } from './TherapistUpdateareasOfExpertiseInputSchema';
import { TherapistUpdateassessmentToolsInputSchema } from './TherapistUpdateassessmentToolsInputSchema';
import { TherapistUpdatetherapeuticApproachesUsedListInputSchema } from './TherapistUpdatetherapeuticApproachesUsedListInputSchema';
import { TherapistUpdatelanguagesOfferedInputSchema } from './TherapistUpdatelanguagesOfferedInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { TherapistUpdatepreferredSessionLengthInputSchema } from './TherapistUpdatepreferredSessionLengthInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { TherapistUpdateexpertiseInputSchema } from './TherapistUpdateexpertiseInputSchema';
import { TherapistUpdateapproachesInputSchema } from './TherapistUpdateapproachesInputSchema';
import { TherapistUpdatelanguagesInputSchema } from './TherapistUpdatelanguagesInputSchema';
import { TherapistUpdateillnessSpecializationsInputSchema } from './TherapistUpdateillnessSpecializationsInputSchema';
import { TherapistUpdateacceptTypesInputSchema } from './TherapistUpdateacceptTypesInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
<<<<<<< HEAD
import { NullableDecimalFieldUpdateOperationsInputSchema } from './NullableDecimalFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
=======
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279

export const TherapistUpdateManyMutationInputSchema: z.ZodType<Prisma.TherapistUpdateManyMutationInput> = z.object({
  mobile: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  province: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  submissionDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  processingDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  providerType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  professionalLicenseType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPRCLicensed: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prcLicenseNumber: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expirationDateOfLicense: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  practiceStartDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
<<<<<<< HEAD
  yearsOfExperience: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  areasOfExpertise: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  assessmentTools: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  therapeuticApproachesUsedList: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  languagesOffered: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  providedOnlineTherapyBefore: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  weeklyAvailability: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  preferredSessionLength: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accepts: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  privateConfidentialSpace: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  compliesWithDataPrivacyAct: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  professionalLiabilityInsurance: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  complaintsOrDisciplinaryActions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  willingToAbideByPlatformGuidelines: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expertise: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  approaches: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  languages: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  acceptTypes: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  uploadedFiles: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  sessionLength: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  hourlyRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bio: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  profileImageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  profileComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  patientSatisfaction: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  totalPatients: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
=======
  areasOfExpertise: z.union([ z.lazy(() => TherapistUpdateareasOfExpertiseInputSchema),z.string().array() ]).optional(),
  assessmentTools: z.union([ z.lazy(() => TherapistUpdateassessmentToolsInputSchema),z.string().array() ]).optional(),
  therapeuticApproachesUsedList: z.union([ z.lazy(() => TherapistUpdatetherapeuticApproachesUsedListInputSchema),z.string().array() ]).optional(),
  languagesOffered: z.union([ z.lazy(() => TherapistUpdatelanguagesOfferedInputSchema),z.string().array() ]).optional(),
  providedOnlineTherapyBefore: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  preferredSessionLength: z.union([ z.lazy(() => TherapistUpdatepreferredSessionLengthInputSchema),z.number().int().array() ]).optional(),
  privateConfidentialSpace: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  compliesWithDataPrivacyAct: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  professionalLiabilityInsurance: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  complaintsOrDisciplinaryActions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  willingToAbideByPlatformGuidelines: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  expertise: z.union([ z.lazy(() => TherapistUpdateexpertiseInputSchema),z.string().array() ]).optional(),
  approaches: z.union([ z.lazy(() => TherapistUpdateapproachesInputSchema),z.string().array() ]).optional(),
  languages: z.union([ z.lazy(() => TherapistUpdatelanguagesInputSchema),z.string().array() ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => TherapistUpdateillnessSpecializationsInputSchema),z.string().array() ]).optional(),
  acceptTypes: z.union([ z.lazy(() => TherapistUpdateacceptTypesInputSchema),z.string().array() ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  sessionLength: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  hourlyRate: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateManyMutationInputSchema;
