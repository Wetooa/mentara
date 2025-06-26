import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { AdminOrderByWithRelationInputSchema } from './AdminOrderByWithRelationInputSchema';
import { MeetingOrderByRelationAggregateInputSchema } from './MeetingOrderByRelationAggregateInputSchema';
import { TherapistAvailabilityOrderByRelationAggregateInputSchema } from './TherapistAvailabilityOrderByRelationAggregateInputSchema';
import { WorksheetOrderByRelationAggregateInputSchema } from './WorksheetOrderByRelationAggregateInputSchema';
import { ClientTherapistOrderByRelationAggregateInputSchema } from './ClientTherapistOrderByRelationAggregateInputSchema';
import { ReviewOrderByRelationAggregateInputSchema } from './ReviewOrderByRelationAggregateInputSchema';
import { TherapistFilesOrderByRelationAggregateInputSchema } from './TherapistFilesOrderByRelationAggregateInputSchema';

export const TherapistOrderByWithRelationInputSchema: z.ZodType<Prisma.TherapistOrderByWithRelationInput> = z.object({
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
  areasOfExpertise: z.lazy(() => SortOrderSchema).optional(),
  assessmentTools: z.lazy(() => SortOrderSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => SortOrderSchema).optional(),
  languagesOffered: z.lazy(() => SortOrderSchema).optional(),
  providedOnlineTherapyBefore: z.lazy(() => SortOrderSchema).optional(),
  comfortableUsingVideoConferencing: z.lazy(() => SortOrderSchema).optional(),
  preferredSessionLength: z.lazy(() => SortOrderSchema).optional(),
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
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  processedByAdmin: z.lazy(() => AdminOrderByWithRelationInputSchema).optional(),
  meetings: z.lazy(() => MeetingOrderByRelationAggregateInputSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityOrderByRelationAggregateInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetOrderByRelationAggregateInputSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  therapistFiles: z.lazy(() => TherapistFilesOrderByRelationAggregateInputSchema).optional()
}).strict();

export default TherapistOrderByWithRelationInputSchema;
