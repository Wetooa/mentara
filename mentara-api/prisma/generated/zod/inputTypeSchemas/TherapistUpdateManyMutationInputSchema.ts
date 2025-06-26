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
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';

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
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateManyMutationInputSchema;
