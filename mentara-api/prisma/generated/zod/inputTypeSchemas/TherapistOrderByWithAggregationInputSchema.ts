import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { TherapistCountOrderByAggregateInputSchema } from './TherapistCountOrderByAggregateInputSchema';
import { TherapistAvgOrderByAggregateInputSchema } from './TherapistAvgOrderByAggregateInputSchema';
import { TherapistMaxOrderByAggregateInputSchema } from './TherapistMaxOrderByAggregateInputSchema';
import { TherapistMinOrderByAggregateInputSchema } from './TherapistMinOrderByAggregateInputSchema';
import { TherapistSumOrderByAggregateInputSchema } from './TherapistSumOrderByAggregateInputSchema';

export const TherapistOrderByWithAggregationInputSchema: z.ZodType<Prisma.TherapistOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  mobile: z.lazy(() => SortOrderSchema).optional(),
  province: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  submissionDate: z.lazy(() => SortOrderSchema).optional(),
  processingDate: z.lazy(() => SortOrderSchema).optional(),
  processedByAdminId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  providerType: z.lazy(() => SortOrderSchema).optional(),
  professionalLicenseType: z.lazy(() => SortOrderSchema).optional(),
  isPRCLicensed: z.lazy(() => SortOrderSchema).optional(),
  prcLicenseNumber: z.lazy(() => SortOrderSchema).optional(),
  expirationDateOfLicense: z.lazy(() => SortOrderSchema).optional(),
  practiceStartDate: z.lazy(() => SortOrderSchema).optional(),
  yearsOfExperience: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  areasOfExpertise: z.lazy(() => SortOrderSchema).optional(),
  assessmentTools: z.lazy(() => SortOrderSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => SortOrderSchema).optional(),
  languagesOffered: z.lazy(() => SortOrderSchema).optional(),
  providedOnlineTherapyBefore: z.lazy(() => SortOrderSchema).optional(),
  comfortableUsingVideoConferencing: z.lazy(() => SortOrderSchema).optional(),
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
<<<<<<< HEAD
  accepts: z.lazy(() => SortOrderSchema).optional(),
  privateConfidentialSpace: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  compliesWithDataPrivacyAct: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  professionalLiabilityInsurance: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  complaintsOrDisciplinaryActions: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  willingToAbideByPlatformGuidelines: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expertise: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  approaches: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  languages: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  acceptTypes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  uploadedFiles: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sessionLength: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  hourlyRate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  bio: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  profileImageUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  profileComplete: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  patientSatisfaction: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  totalPatients: z.lazy(() => SortOrderSchema).optional(),
=======
  privateConfidentialSpace: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  compliesWithDataPrivacyAct: z.lazy(() => SortOrderSchema).optional(),
  professionalLiabilityInsurance: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  complaintsOrDisciplinaryActions: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  willingToAbideByPlatformGuidelines: z.lazy(() => SortOrderSchema).optional(),
  expertise: z.lazy(() => SortOrderSchema).optional(),
  approaches: z.lazy(() => SortOrderSchema).optional(),
  languages: z.lazy(() => SortOrderSchema).optional(),
  illnessSpecializations: z.lazy(() => SortOrderSchema).optional(),
  acceptTypes: z.lazy(() => SortOrderSchema).optional(),
  treatmentSuccessRates: z.lazy(() => SortOrderSchema).optional(),
  sessionLength: z.lazy(() => SortOrderSchema).optional(),
  hourlyRate: z.lazy(() => SortOrderSchema).optional(),
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TherapistCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TherapistAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TherapistMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TherapistMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TherapistSumOrderByAggregateInputSchema).optional()
}).strict();

export default TherapistOrderByWithAggregationInputSchema;
