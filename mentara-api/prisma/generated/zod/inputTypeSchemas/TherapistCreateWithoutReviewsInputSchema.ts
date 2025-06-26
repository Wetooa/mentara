import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { UserCreateNestedOneWithoutTherapistInputSchema } from './UserCreateNestedOneWithoutTherapistInputSchema';
import { MeetingCreateNestedManyWithoutTherapistInputSchema } from './MeetingCreateNestedManyWithoutTherapistInputSchema';
import { TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema } from './TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema';
import { WorksheetCreateNestedManyWithoutTherapistInputSchema } from './WorksheetCreateNestedManyWithoutTherapistInputSchema';
import { ClientTherapistCreateNestedManyWithoutTherapistInputSchema } from './ClientTherapistCreateNestedManyWithoutTherapistInputSchema';

export const TherapistCreateWithoutReviewsInputSchema: z.ZodType<Prisma.TherapistCreateWithoutReviewsInput> = z.object({
  approved: z.boolean().optional(),
  status: z.string().optional(),
  submissionDate: z.coerce.date().optional(),
  processingDate: z.coerce.date().optional().nullable(),
  processedBy: z.string().optional().nullable(),
  applicationData: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  mobile: z.string(),
  province: z.string(),
  providerType: z.string(),
  professionalLicenseType: z.string(),
  isPRCLicensed: z.string(),
  prcLicenseNumber: z.string(),
  expirationDateOfLicense: z.coerce.date().optional().nullable(),
  isLicenseActive: z.string(),
  practiceStartDate: z.coerce.date(),
  areasOfExpertise: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  assessmentTools: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  therapeuticApproachesUsedList: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  languagesOffered: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  providedOnlineTherapyBefore: z.string(),
  comfortableUsingVideoConferencing: z.string(),
  weeklyAvailability: z.string(),
  preferredSessionLength: z.string(),
  accepts: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  sessionLength: z.string().optional().nullable(),
  hourlyRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  expertise: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  approaches: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  languages: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  acceptTypes: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  uploadedFiles: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  bio: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  profileComplete: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutTherapistInputSchema),
  meetings: z.lazy(() => MeetingCreateNestedManyWithoutTherapistInputSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityCreateNestedManyWithoutTherapistInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetCreateNestedManyWithoutTherapistInputSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistCreateNestedManyWithoutTherapistInputSchema).optional()
}).strict();

export default TherapistCreateWithoutReviewsInputSchema;
