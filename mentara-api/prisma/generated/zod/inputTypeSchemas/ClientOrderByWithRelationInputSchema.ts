import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { WorksheetOrderByRelationAggregateInputSchema } from './WorksheetOrderByRelationAggregateInputSchema';
import { PreAssessmentOrderByWithRelationInputSchema } from './PreAssessmentOrderByWithRelationInputSchema';
import { WorksheetSubmissionOrderByRelationAggregateInputSchema } from './WorksheetSubmissionOrderByRelationAggregateInputSchema';
import { ClientMedicalHistoryOrderByRelationAggregateInputSchema } from './ClientMedicalHistoryOrderByRelationAggregateInputSchema';
import { ClientPreferenceOrderByRelationAggregateInputSchema } from './ClientPreferenceOrderByRelationAggregateInputSchema';
import { ClientTherapistOrderByRelationAggregateInputSchema } from './ClientTherapistOrderByRelationAggregateInputSchema';
import { MeetingOrderByRelationAggregateInputSchema } from './MeetingOrderByRelationAggregateInputSchema';
import { ReviewOrderByRelationAggregateInputSchema } from './ReviewOrderByRelationAggregateInputSchema';

export const ClientOrderByWithRelationInputSchema: z.ZodType<Prisma.ClientOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  hasSeenTherapistRecommendations: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  worksheets: z.lazy(() => WorksheetOrderByRelationAggregateInputSchema).optional(),
  preAssessment: z.lazy(() => PreAssessmentOrderByWithRelationInputSchema).optional(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionOrderByRelationAggregateInputSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryOrderByRelationAggregateInputSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceOrderByRelationAggregateInputSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistOrderByRelationAggregateInputSchema).optional(),
  meetings: z.lazy(() => MeetingOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional()
}).strict();

export default ClientOrderByWithRelationInputSchema;
