import { z } from 'zod';
import {
  ClientSchema,
  PreAssessmentSchema,
  UserSchema,
  WorksheetSchema,
  WorksheetSubmissionSchema,
  ClientMedicalHistorySchema,
  ClientPreferenceSchema,
  ClientTherapistSchema,
  MeetingSchema,
  TherapistSchema,
  TherapistAvailabilitySchema,
  ClientUpdateInputSchema,
  TherapistUpdateInputSchema,
} from 'prisma/generated/zod';

export type ClientResponse = z.infer<
  typeof ClientSchema & {
    user: z.infer<typeof UserSchema>;
    worksheets: z.infer<typeof WorksheetSchema>[];
    preAssessment: z.infer<typeof PreAssessmentSchema>;
    worksheetSubmissions: z.infer<typeof WorksheetSubmissionSchema>[];
    clientMedicalHistory: z.infer<typeof ClientMedicalHistorySchema>[];
    clientPreferences: z.infer<typeof ClientPreferenceSchema>[];
    assignedTherapists: z.infer<typeof ClientTherapistSchema>[];
    meetings: z.infer<typeof MeetingSchema>[];
  }
>;

export type TherapistResponse = z.infer<
  typeof TherapistSchema & {
    user: z.infer<typeof UserSchema>;
    assignedClients: z.infer<typeof ClientTherapistSchema>[];
    meetings: z.infer<typeof MeetingSchema>[];
    therapistAvailabilities: z.infer<typeof TherapistAvailabilitySchema>[];
    worksheets: z.infer<typeof WorksheetSchema>[];
  }
>;

export type ClientUpdateDto = z.infer<typeof ClientUpdateInputSchema>;
export type TherapistUpdateDto = z.infer<typeof TherapistUpdateInputSchema>;
