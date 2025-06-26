import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { MeetingOrderByRelationAggregateInputSchema } from './MeetingOrderByRelationAggregateInputSchema';
import { TherapistAvailabilityOrderByRelationAggregateInputSchema } from './TherapistAvailabilityOrderByRelationAggregateInputSchema';
import { WorksheetOrderByRelationAggregateInputSchema } from './WorksheetOrderByRelationAggregateInputSchema';
import { ClientTherapistOrderByRelationAggregateInputSchema } from './ClientTherapistOrderByRelationAggregateInputSchema';
import { ReviewOrderByRelationAggregateInputSchema } from './ReviewOrderByRelationAggregateInputSchema';

export const TherapistOrderByWithRelationInputSchema: z.ZodType<Prisma.TherapistOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  approved: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  submissionDate: z.lazy(() => SortOrderSchema).optional(),
  processingDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  processedBy: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  applicationData: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  mobile: z.lazy(() => SortOrderSchema).optional(),
  province: z.lazy(() => SortOrderSchema).optional(),
  providerType: z.lazy(() => SortOrderSchema).optional(),
  professionalLicenseType: z.lazy(() => SortOrderSchema).optional(),
  isPRCLicensed: z.lazy(() => SortOrderSchema).optional(),
  prcLicenseNumber: z.lazy(() => SortOrderSchema).optional(),
  expirationDateOfLicense: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isLicenseActive: z.lazy(() => SortOrderSchema).optional(),
  practiceStartDate: z.lazy(() => SortOrderSchema).optional(),
  yearsOfExperience: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  areasOfExpertise: z.lazy(() => SortOrderSchema).optional(),
  assessmentTools: z.lazy(() => SortOrderSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => SortOrderSchema).optional(),
  languagesOffered: z.lazy(() => SortOrderSchema).optional(),
  providedOnlineTherapyBefore: z.lazy(() => SortOrderSchema).optional(),
  comfortableUsingVideoConferencing: z.lazy(() => SortOrderSchema).optional(),
  weeklyAvailability: z.lazy(() => SortOrderSchema).optional(),
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
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
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  meetings: z.lazy(() => MeetingOrderByRelationAggregateInputSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityOrderByRelationAggregateInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetOrderByRelationAggregateInputSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional()
}).strict();

export default TherapistOrderByWithRelationInputSchema;
