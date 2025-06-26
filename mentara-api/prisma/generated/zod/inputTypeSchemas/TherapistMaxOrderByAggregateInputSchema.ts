import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TherapistMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TherapistMaxOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  mobile: z.lazy(() => SortOrderSchema).optional(),
  province: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  submissionDate: z.lazy(() => SortOrderSchema).optional(),
  processingDate: z.lazy(() => SortOrderSchema).optional(),
  processedByAdminId: z.lazy(() => SortOrderSchema).optional(),
  providerType: z.lazy(() => SortOrderSchema).optional(),
  professionalLicenseType: z.lazy(() => SortOrderSchema).optional(),
  isPRCLicensed: z.lazy(() => SortOrderSchema).optional(),
  prcLicenseNumber: z.lazy(() => SortOrderSchema).optional(),
  expirationDateOfLicense: z.lazy(() => SortOrderSchema).optional(),
  practiceStartDate: z.lazy(() => SortOrderSchema).optional(),
  yearsOfExperience: z.lazy(() => SortOrderSchema).optional(),
  providedOnlineTherapyBefore: z.lazy(() => SortOrderSchema).optional(),
  comfortableUsingVideoConferencing: z.lazy(() => SortOrderSchema).optional(),
<<<<<<< HEAD
  weeklyAvailability: z.lazy(() => SortOrderSchema).optional(),
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
=======
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  privateConfidentialSpace: z.lazy(() => SortOrderSchema).optional(),
  compliesWithDataPrivacyAct: z.lazy(() => SortOrderSchema).optional(),
  professionalLiabilityInsurance: z.lazy(() => SortOrderSchema).optional(),
  complaintsOrDisciplinaryActions: z.lazy(() => SortOrderSchema).optional(),
  willingToAbideByPlatformGuidelines: z.lazy(() => SortOrderSchema).optional(),
  sessionLength: z.lazy(() => SortOrderSchema).optional(),
  hourlyRate: z.lazy(() => SortOrderSchema).optional(),
<<<<<<< HEAD
  bio: z.lazy(() => SortOrderSchema).optional(),
  profileImageUrl: z.lazy(() => SortOrderSchema).optional(),
  profileComplete: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  patientSatisfaction: z.lazy(() => SortOrderSchema).optional(),
  totalPatients: z.lazy(() => SortOrderSchema).optional(),
=======
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TherapistMaxOrderByAggregateInputSchema;
