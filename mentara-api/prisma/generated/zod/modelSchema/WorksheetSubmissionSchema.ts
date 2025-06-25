import { z } from 'zod';

/////////////////////////////////////////
// WORKSHEET SUBMISSION SCHEMA
/////////////////////////////////////////

export const WorksheetSubmissionSchema = z.object({
  id: z.string().uuid(),
  worksheetId: z.string(),
  clientId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
})

export type WorksheetSubmission = z.infer<typeof WorksheetSubmissionSchema>

export default WorksheetSubmissionSchema;
