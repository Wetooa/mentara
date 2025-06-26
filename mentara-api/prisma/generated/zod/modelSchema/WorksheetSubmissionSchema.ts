import { z } from 'zod';

/////////////////////////////////////////
// WORKSHEET SUBMISSION SCHEMA
/////////////////////////////////////////

export const WorksheetSubmissionSchema = z.object({
  id: z.string().uuid(),
  worksheetId: z.string(),
  clientId: z.string(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().nullable(),
  fileType: z.string().nullable(),
  content: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type WorksheetSubmission = z.infer<typeof WorksheetSubmissionSchema>

export default WorksheetSubmissionSchema;
